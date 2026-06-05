import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  setGroupSchedule,
  getGroupSchedule,
  removeGroupSchedule,
} from "../../utils/database.js";
import { setScheduleMessage } from "../../services/groupScheduler.js";

export default {
  name: "agendar-grupo",
  description: "Agenda fechamento e abertura do grupo.",
  commands: [
    "agendar-grupo",
    "agendargrupo",
    "schedulegroup",
    "agendar-fechar",
    "agendarfechar",
  ],
  usage: `${PREFIX}agendar-grupo fechar | 22:00\n${PREFIX}agendar-grupo abrir | 08:00\n${PREFIX}agendar-grupo ver\n${PREFIX}agendar-grupo cancelar\n${PREFIX}agendar-grupo mensagem | boaNoite | texto`,

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
          `⏰ *Agendar Fechamento/Abertura*\n\n` +
          `• ${PREFIX}agendar-grupo fechar | 22:00\n` +
          `• ${PREFIX}agendar-grupo abrir | 08:00\n` +
          `• ${PREFIX}agendar-grupo ver\n` +
          `• ${PREFIX}agendar-grupo cancelar\n` +
          `• ${PREFIX}agendar-grupo mensagem | boaNoite | texto\n` +
          `• ${PREFIX}agendar-grupo mensagem | bomDia | texto\n` +
          `⚠️ Formato: HH:MM (24h)`
        );
      }

      const action = args[0].toLowerCase();

      // MENSAGEM PERSONALIZADA
      if (action === "mensagem" || action === "msg") {
        const tipo = args[1]?.toLowerCase();
        const texto = args.slice(2).join(" ").trim();

        if (!tipo || (tipo !== "boanoite" && tipo !== "bomdia")) {
          return sendReply("Use: `/agendar-grupo mensagem | boaNoite | texto` ou `bomDia`");
        }
        if (!texto) return sendReply("Digite a mensagem!");

        setScheduleMessage(remoteJid, tipo === "boanoite" ? "boaNoite" : "bomDia", texto);
        await sendSuccessReact();
        return sendReply(`✅ Mensagem de ${tipo} definida!`);
      }

      // FECHAR
      if (action === "fechar" || action === "close" || action === "fechamento") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato 24h: HH:MM\nEx: 22:00");
        }

        const schedule = getGroupSchedule(remoteJid) || {};
        schedule.closeTime = horario;
        schedule.active = true;
        setGroupSchedule(remoteJid, schedule);

        await sendSuccessReact();
        return sendReply(
          `🔒 *Fechamento agendado para ${horario}!*\n` +
          `Use \`/agendar-grupo mensagem | boaNoite | texto\` para personalizar.`
        );
      }

      // ABRIR
      if (action === "abrir" || action === "open" || action === "abertura") {
        const horario = args[1];
        if (!horario || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horario)) {
          throw new InvalidParameterError("Horário inválido!\nFormato 24h: HH:MM\nEx: 08:00");
        }

        const schedule = getGroupSchedule(remoteJid) || {};
        schedule.openTime = horario;
        schedule.active = true;
        setGroupSchedule(remoteJid, schedule);

        await sendSuccessReact();
        return sendReply(
          `🔓 *Abertura agendada para ${horario}!*\n` +
          `Use \`/agendar-grupo mensagem | bomDia | texto\` para personalizar.`
        );
      }

      // VER
      if (action === "ver" || action === "view" || action === "show") {
        const schedule = getGroupSchedule(remoteJid);
        if (!schedule || !schedule.active) {
          return sendReply("Nenhum agendamento configurado.");
        }

        let msg = "📋 *Agendamento do Grupo*\n\n";
        if (schedule.closeTime) msg += `🔒 Fechar: ${schedule.closeTime}\n`;
        if (schedule.openTime) msg += `🔓 Abrir: ${schedule.openTime}\n`;
        return sendReply(msg);
      }

      // CANCELAR
      if (action === "cancelar" || action === "cancel" || action === "remover") {
        const schedule = getGroupSchedule(remoteJid);
        if (!schedule || !schedule.active) {
          throw new WarningError("Não há agendamento para cancelar!");
        }

        removeGroupSchedule(remoteJid);
        await sendSuccessReact();
        return sendReply("✅ Agendamento cancelado!");
      }

      throw new InvalidParameterError(
        `Opção inválida: "${action}"\nUse: fechar, abrir, ver, cancelar ou mensagem`
      );

    } catch (error) {
      await sendErrorReply(`${error.message}`);
    }
  },
};