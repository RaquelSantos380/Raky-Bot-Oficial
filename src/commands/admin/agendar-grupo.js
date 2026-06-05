import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import fs from "fs";
import path from "path";

const AGENDA_FILE = path.resolve("database", "agenda-grupo.json");

function lerAgenda() {
  try {
    if (fs.existsSync(AGENDA_FILE)) return JSON.parse(fs.readFileSync(AGENDA_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function salvarAgenda(data) {
  fs.writeFileSync(AGENDA_FILE, JSON.stringify(data, null, 2));
}

// Cache de intervalos
const timers = {};

export function iniciarAgendaGrupo(socket) {
  const agenda = lerAgenda();
  
  for (const [groupId, config] of Object.entries(agenda)) {
    agendarTarefa(socket, groupId, config);
  }
}

function agendarTarefa(socket, groupId, config) {
  const agora = new Date();
  const agoraMinutos = agora.getHours() * 60 + agora.getMinutes();

  // Agendar fechar
  if (config.fechar) {
    const [h, m] = config.fechar.split(":").map(Number);
    const fecharMinutos = h * 60 + m;
    let delayFechar = fecharMinutos - agoraMinutos;
    if (delayFechar < 0) delayFechar += 24 * 60; // próximo dia
    
    const keyF = groupId + "_fechar";
    if (timers[keyF]) clearTimeout(timers[keyF]);
    
    timers[keyF] = setTimeout(async () => {
      try {
        // Envia mensagem de boa noite
        if (config.boaNoiteMsg) {
          await socket.sendMessage(groupId, { text: config.boaNoiteMsg });
        }
        // Fecha o grupo
        await socket.sendMessage(groupId, { text: `/fechar` });
        await socket.groupSettingUpdate(groupId, "announcement");
        console.log(`🔒 Grupo fechado: ${groupId}`);
        // Reagenda para o próximo dia
        agendarTarefa(socket, groupId, config);
      } catch (e) {
        console.log(`Erro ao fechar: ${e.message}`);
      }
    }, delayFechar * 60 * 1000);
  }

  // Agendar abrir
  if (config.abrir) {
    const [h, m] = config.abrir.split(":").map(Number);
    const abrirMinutos = h * 60 + m;
    let delayAbrir = abrirMinutos - agoraMinutos;
    if (delayAbrir < 0) delayAbrir += 24 * 60;
    
    const keyA = groupId + "_abrir";
    if (timers[keyA]) clearTimeout(timers[keyA]);
    
    timers[keyA] = setTimeout(async () => {
      try {
        await socket.groupSettingUpdate(groupId, "not_announcement");
        if (config.bomDiaMsg) {
          await socket.sendMessage(groupId, { text: config.bomDiaMsg });
        }
        console.log(`🔓 Grupo aberto: ${groupId}`);
        agendarTarefa(socket, groupId, config);
      } catch (e) {
        console.log(`Erro ao abrir: ${e.message}`);
      }
    }, delayAbrir * 60 * 1000);
  }
}

export default {
  name: "agendar-grupo",
  description: "Agenda fechamento e abertura do grupo.",
  commands: ["agendar-grupo", "agendargrupo", "schedulegroup"],
  usage: `${PREFIX}agendar-grupo fechar | 22:00\n${PREFIX}agendar-grupo abrir | 08:00\n${PREFIX}agendar-grupo mensagem | boaNoite | texto\n${PREFIX}agendar-grupo ver\n${PREFIX}agendar-grupo cancelar`,

  handle: async ({
    args,
    remoteJid,
    socket,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        return sendReply(
          `⏰ *Agendar Grupo*\n\n` +
          `• ${PREFIX}agendar-grupo fechar | 22:00\n` +
          `• ${PREFIX}agendar-grupo abrir | 08:00\n` +
          `• ${PREFIX}agendar-grupo mensagem | boaNoite | texto\n` +
          `• ${PREFIX}agendar-grupo mensagem | bomDia | texto\n` +
          `• ${PREFIX}agendar-grupo ver\n` +
          `• ${PREFIX}agendar-grupo cancelar\n` +
          `⚠️ Bot precisa ser ADMIN no grupo!`
        );
      }

      const action = args[0].toLowerCase();

      // MENSAGEM
      if (action === "mensagem" || action === "msg") {
        const tipo = args[1]?.toLowerCase();
        const texto = args.slice(2).join(" ").trim();

        if (!tipo || (tipo !== "boanoite" && tipo !== "bomdia")) {
          return sendReply("Use: `boaNoite` ou `bomDia`");
        }
        if (!texto) return sendReply("Digite a mensagem!");

        const agenda = lerAgenda();
        if (!agenda[remoteJid]) agenda[remoteJid] = {};
        if (tipo === "boanoite") agenda[remoteJid].boaNoiteMsg = texto;
        else agenda[remoteJid].bomDiaMsg = texto;
        salvarAgenda(agenda);

        await sendSuccessReact();
        return sendReply(`✅ Mensagem de ${tipo} definida!`);
      }

      // FECHAR
      if (action === "fechar" || action === "close") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato HH:MM\nEx: 22:00");
        }

        const agenda = lerAgenda();
        if (!agenda[remoteJid]) agenda[remoteJid] = {};
        agenda[remoteJid].fechar = horario;
        salvarAgenda(agenda);

        // Cancela timer antigo
        const keyF = remoteJid + "_fechar";
        if (timers[keyF]) clearTimeout(timers[keyF]);

        agendarTarefa(socket, remoteJid, agenda[remoteJid]);

        await sendSuccessReact();
        return sendReply(`🔒 Fechamento agendado para *${horario}*!\nUse \`/agendar-grupo mensagem | boaNoite | texto\` para personalizar.`);
      }

      // ABRIR
      if (action === "abrir" || action === "open") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato HH:MM\nEx: 08:00");
        }

        const agenda = lerAgenda();
        if (!agenda[remoteJid]) agenda[remoteJid] = {};
        agenda[remoteJid].abrir = horario;
        salvarAgenda(agenda);

        const keyA = remoteJid + "_abrir";
        if (timers[keyA]) clearTimeout(timers[keyA]);

        agendarTarefa(socket, remoteJid, agenda[remoteJid]);

        await sendSuccessReact();
        return sendReply(`🔓 Abertura agendada para *${horario}*!\nUse \`/agendar-grupo mensagem | bomDia | texto\` para personalizar.`);
      }

      // VER
      if (action === "ver" || action === "view") {
        const agenda = lerAgenda();
        const config = agenda[remoteJid];

        if (!config || (!config.fechar && !config.abrir)) {
          return sendReply("Nenhum agendamento configurado.");
        }

        let msg = "📋 *Agendamentos*\n\n";
        if (config.fechar) msg += `🔒 Fechar: ${config.fechar}\n`;
        if (config.abrir) msg += `🔓 Abrir: ${config.abrir}\n`;
        if (config.boaNoiteMsg) msg += `🌙 Boa noite: "${config.boaNoiteMsg}"\n`;
        if (config.bomDiaMsg) msg += `☀️ Bom dia: "${config.bomDiaMsg}"\n`;
        return sendReply(msg);
      }

      // CANCELAR
      if (action === "cancelar" || action === "cancel") {
        const agenda = lerAgenda();
        delete agenda[remoteJid];
        salvarAgenda(agenda);

        const keyF = remoteJid + "_fechar";
        const keyA = remoteJid + "_abrir";
        if (timers[keyF]) clearTimeout(timers[keyF]);
        if (timers[keyA]) clearTimeout(timers[keyA]);

        await sendSuccessReact();
        return sendReply("✅ Todos os agendamentos cancelados!");
      }

      throw new InvalidParameterError("Use: fechar, abrir, ver, cancelar ou mensagem");

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};