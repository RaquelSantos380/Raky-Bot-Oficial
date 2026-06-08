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

let intervalId = null;
let lastMinute = -1;

export function iniciarAgendaGrupo(socket) {
  if (intervalId) clearInterval(intervalId);
  console.log("⏰ Agendador de grupo iniciado (setInterval)!");
  lastMinute = -1;

  intervalId = setInterval(async () => {
    try {
      const agora = new Date();
      const currentHour = agora.getHours().toString().padStart(2, "0");
      const currentMinute = agora.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;
      const currentMinuteNum = agora.getMinutes();
      if (currentMinuteNum === lastMinute) return;
      lastMinute = currentMinuteNum;

      const agenda = lerAgenda();

      for (const [groupId, config] of Object.entries(agenda)) {
        if (config.fechar === currentTime) {
          try {
            await socket.groupSettingUpdate(groupId, "announcement");
            console.log(`🔒 Grupo fechado: ${groupId} às ${currentTime}`);
            if (config.msgFechar) {
              await socket.sendMessage(groupId, { text: config.msgFechar });
            }
          } catch (e) {
            console.log(`Erro ao fechar: ${e.message}`);
          }
        }

        if (config.abrir === currentTime) {
          try {
            await socket.groupSettingUpdate(groupId, "not_announcement");
            console.log(`🔓 Grupo aberto: ${groupId} às ${currentTime}`);
            if (config.msgAbrir) {
              await socket.sendMessage(groupId, { text: config.msgAbrir });
            }
          } catch (e) {
            console.log(`Erro ao abrir: ${e.message}`);
          }
        }
      }
    } catch (error) {
      console.log(`Erro no agendador: ${error.message}`);
    }
  }, 30000);
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
        await sendSuccessReact();
        return sendReply("✅ Cancelado!");
      }

      throw new InvalidParameterError("Use: fechar, abrir, ver ou cancelar");

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};