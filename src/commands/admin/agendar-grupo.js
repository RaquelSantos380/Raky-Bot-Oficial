import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  setGroupSchedule,
  getGroupSchedule,
  removeGroupSchedule,
} from "../../utils/database.js";

export default {
  name: "agendar-grupo",
  description: "Agenda fechamento e abertura do grupo em horários específicos.",
  commands: [
    "agendar-grupo",
    "agendargrupo",
    "schedulegroup",
    "agendar-fechar",
    "agendarfechar",
  ],
  usage: `${PREFIX}agendar-grupo fechar | 22:00 | abrir | 08:00\n${PREFIX}agendar-grupo ver\n${PREFIX}agendar-grupo cancelar`,

  handle: async ({
    args,
    remoteJid,
    socket,
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    try {
      if (!args.length) {
        return sendReply(
          `⏰ *Agendar Fechamento/Abertura do Grupo*\n\n` +
          `📝 *Comandos:*\n\n` +
          `• ${PREFIX}agendar-grupo fechar | <horário>\n` +
          `  Ex: ${PREFIX}agendar-grupo fechar | 22:00\n\n` +
          `• ${PREFIX}agendar-grupo abrir | <horário>\n` +
          `  Ex: ${PREFIX}agendar-grupo abrir | 08:00\n\n` +
          `• ${PREFIX}agendar-grupo ver\n` +
          `  Mostra horários programados\n\n` +
          `• ${PREFIX}agendar-grupo cancelar\n` +
          `  Remove o agendamento\n\n` +
          `⚠️ Use | para separar os argumentos!\n` +
          `📌 Formato: HH:MM (24h)`
        );
      }

      const action = args[0].toLowerCase();

      if (action === "fechar" || action === "close" || action === "fechamento") {
        const horario = args.slice(1).join(" ").trim();
        
        if (!horario) {
          throw new InvalidParameterError(
            "Digite o horário!\nEx: /agendar-grupo fechar | 22:00"
          );
        }

        // Valida formato HH:MM
        const horarioRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horarioRegex.test(horario)) {
          throw new InvalidParameterError(
            "Horário inválido!\nUse formato 24h: HH:MM\nEx: 22:00"
          );
        }

        const schedule = getGroupSchedule(remoteJid) || {};
        schedule.closeTime = horario;
        schedule.active = true;
        setGroupSchedule(remoteJid, schedule);

        await sendSuccessReact();
        return sendReply(
          `🔒 *Fechamento agendado!*\n\n` +
          `⏰ Horário: *${horario}*\n\n` +
          `O grupo será fechado automaticamente às ${horario}.\n` +
          `Use ${PREFIX}agendar-grupo ver para conferir.`
        );
      }

      if (action === "abrir" || action === "open" || action === "abertura") {
        const horario = args.slice(1).join(" ").trim();
        
        if (!horario) {
          throw new InvalidParameterError(
            "Digite o horário!\nEx: /agendar-grupo abrir | 08:00"
          );
        }

        const horarioRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!horarioRegex.test(horario)) {
          throw new InvalidParameterError(
            "Horário inválido!\nUse formato 24h: HH:MM\nEx: 08:00"
          );
        }

        const schedule = getGroupSchedule(remoteJid) || {};
        schedule.openTime = horario;
        schedule.active = true;
        setGroupSchedule(remoteJid, schedule);

        await sendSuccessReact();
        return sendReply(
          `🔓 *Abertura agendada!*\n\n` +
          `⏰ Horário: *${horario}*\n\n` +
          `O grupo será aberto automaticamente às ${horario}.\n` +
          `Use ${PREFIX}agendar-grupo ver para conferir.`
        );
      }

      if (action === "ver" || action === "view" || action === "show") {
        const schedule = getGroupSchedule(remoteJid);

        if (!schedule || !schedule.active) {
          return sendReply(
            "📋 *Agendamento do Grupo*\n\n" +
            "Nenhum agendamento configurado.\n\n" +
            `Use ${PREFIX}agendar-grupo para ver opções.`
          );
        }

        let msg = "📋 *Agendamento do Grupo*\n\n";
        
        if (schedule.closeTime) {
          msg += `🔒 *Fechar:* ${schedule.closeTime}\n`;
        } else {
          msg += "🔒 *Fechar:* Não definido\n";
        }

        if (schedule.openTime) {
          msg += `🔓 *Abrir:* ${schedule.openTime}\n`;
        } else {
          msg += "🔓 *Abrir:* Não definido\n";
        }

        msg += `\nStatus: ✅ Ativo\n\n`;
        msg += `Use ${PREFIX}agendar-grupo cancelar para remover.`;

        return sendReply(msg);
      }

      if (action === "cancelar" || action === "cancel" || action === "remover") {
        const schedule = getGroupSchedule(remoteJid);

        if (!schedule || !schedule.active) {
          throw new WarningError("Não há agendamento para cancelar!");
        }

        removeGroupSchedule(remoteJid);
        await sendSuccessReact();
        return sendReply("✅ *Agendamento cancelado!*");
      }

      throw new InvalidParameterError(
        `Opção inválida: "${action}"\nUse: fechar, abrir, ver ou cancelar`
      );

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};