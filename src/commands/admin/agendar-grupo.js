import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
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

  if (config.fechar) {
    const [h, m] = config.fechar.split(":").map(Number);
    let fecharMinutos = h * 60 + m;
    let delayMinutos = fecharMinutos - agoraMinutos;
    if (delayMinutos <= 0) delayMinutos += 24 * 60;

    const delayMs = delayMinutos * 60 * 1000;
    console.log(`⏰ Agendado FECHAR em ${delayMinutos} minutos (${config.fechar})`);

    const keyF = groupId + "_fechar";
    if (timers[keyF]) clearTimeout(timers[keyF]);

    timers[keyF] = setTimeout(async () => {
      try {
        await socket.groupSettingUpdate(groupId, "announcement");
        console.log(`🔒 Grupo fechado: ${groupId}`);
        if (config.msgFechar) {
          await socket.sendMessage(groupId, { text: config.msgFechar });
        }
      } catch (e) {
        console.log(`Erro ao fechar: ${e.message}`);
      }
    }, delayMs);
  }

  if (config.abrir) {
    const [h, m] = config.abrir.split(":").map(Number);
    let abrirMinutos = h * 60 + m;
    let delayMinutos = abrirMinutos - agoraMinutos;
    if (delayMinutos <= 0) delayMinutos += 24 * 60;

    const delayMs = delayMinutos * 60 * 1000;
    console.log(`⏰ Agendado ABRIR em ${delayMinutos} minutos (${config.abrir})`);

    const keyA = groupId + "_abrir";
    if (timers[keyA]) clearTimeout(timers[keyA]);

    timers[keyA] = setTimeout(async () => {
      try {
        await socket.groupSettingUpdate(groupId, "not_announcement");
        console.log(`🔓 Grupo aberto: ${groupId}`);
        if (config.msgAbrir) {
          await socket.sendMessage(groupId, { text: config.msgAbrir });
        }
      } catch (e) {
        console.log(`Erro ao abrir: ${e.message}`);
      }
    }, delayMs);
  }
}

export default {
  name: "agendar-grupo",
  description: "Agenda fechamento e abertura do grupo.",
  commands: ["agendar-grupo", "agendargrupo"],
  usage: `${PREFIX}agendar-grupo fechar | 22:00\n${PREFIX}agendar-grupo abrir | 08:00\n${PREFIX}agendar-grupo ver\n${PREFIX}agendar-grupo cancelar`,

  handle: async ({
    args,
    remoteJid,
    socket,
    sendReply,
    sendErrorReply,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        return sendReply(
          `⏰ *Agendar Grupo*\n\n` +
          `• ${PREFIX}agendar-grupo fechar | 22:00\n` +
          `• ${PREFIX}agendar-grupo abrir | 08:00\n` +
          `• ${PREFIX}agendar-grupo ver\n` +
          `• ${PREFIX}agendar-grupo cancelar`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "fechar" || action === "close") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato HH:MM\nEx: 22:00");
        }

        const agenda = lerAgenda();
        if (!agenda[remoteJid]) agenda[remoteJid] = {};
        agenda[remoteJid].fechar = horario;
        agenda[remoteJid].msgFechar = `Grupo fechado para a *segurança* de *vocês*! 🫶🏻🎀 Um bom descanso a todos! ✅Abrirá *cedo*`;
        salvarAgenda(agenda);

        if (timers[remoteJid + "_fechar"]) clearTimeout(timers[remoteJid + "_fechar"]);
        agendarTarefa(socket, remoteJid, agenda[remoteJid]);

        await sendSuccessReact();
        return sendReply(`🔒 Agendado para *${horario}*!`);
      }

      if (action === "abrir" || action === "open") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato HH:MM\nEx: 08:00");
        }

        const agenda = lerAgenda();
        if (!agenda[remoteJid]) agenda[remoteJid] = {};
        agenda[remoteJid].abrir = horario;
        agenda[remoteJid].msgAbrir = `☀️ Bom dia! O grupo está aberto!`;
        salvarAgenda(agenda);

        if (timers[remoteJid + "_abrir"]) clearTimeout(timers[remoteJid + "_abrir"]);
        agendarTarefa(socket, remoteJid, agenda[remoteJid]);

        await sendSuccessReact();
        return sendReply(`🔓 Agendado para *${horario}*!`);
      }

      if (action === "ver" || action === "view") {
        const agenda = lerAgenda();
        const config = agenda[remoteJid];
        if (!config || (!config.fechar && !config.abrir)) return sendReply("Nenhum agendamento.");
        let msg = "📋 *Agendamentos*\n\n";
        if (config.fechar) msg += `🔒 Fechar: ${config.fechar}\n`;
        if (config.abrir) msg += `🔓 Abrir: ${config.abrir}\n`;
        return sendReply(msg);
      }

      if (action === "cancelar" || action === "cancel") {
        const agenda = lerAgenda();
        delete agenda[remoteJid];
        salvarAgenda(agenda);
        if (timers[remoteJid + "_fechar"]) clearTimeout(timers[remoteJid + "_fechar"]);
        if (timers[remoteJid + "_abrir"]) clearTimeout(timers[remoteJid + "_abrir"]);
        await sendSuccessReact();
        return sendReply("✅ Cancelado!");
      }

      throw new InvalidParameterError("Use: fechar, abrir, ver ou cancelar");

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};