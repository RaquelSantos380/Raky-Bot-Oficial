import { getAllActiveSchedules } from "../utils/database.js";
import { errorLog, infoLog } from "../utils/logger.js";

let intervalId = null;

export function startGroupScheduler(socket) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  infoLog("⏰ Agendador de grupos iniciado!");

  intervalId = setInterval(async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      const schedules = getAllActiveSchedules();

      for (const [groupId, schedule] of Object.entries(schedules)) {
        try {
          if (schedule.closeTime === currentTime) {
            await socket.groupSettingUpdate(groupId, "announcement");
            infoLog(`🔒 Grupo fechado: ${groupId} às ${currentTime}`);
          }

          if (schedule.openTime === currentTime) {
            await socket.groupSettingUpdate(groupId, "not_announcement");
            infoLog(`🔓 Grupo aberto: ${groupId} às ${currentTime}`);
          }
        } catch (groupError) {
          errorLog(`Erro ao processar agendamento do grupo ${groupId}: ${groupError.message}`);
        }
      }
    } catch (error) {
      errorLog(`Erro no agendador: ${error.message}`);
    }
  }, 60000);
}

export function stopGroupScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
