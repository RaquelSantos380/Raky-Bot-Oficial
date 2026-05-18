import { OWNER_LID } from "../config.js";
import { errorLog } from "../utils/logger.js";

export async function protegerRaquel(socket, remoteJid, userLid, action, data) {
  // Só verifica quando alguém é rebaixado/removido
  if (action !== "demote" && action !== "remove") return;
  
  // Se NÃO for a Raquel sendo afetada, ignora
  const raquelLid = "556292900737@lid";
  if (data !== raquelLid) return;

  try {
    // Recoloca como admin
    await socket.groupParticipantsUpdate(remoteJid, [raquelLid], "promote");
    console.log(`🛡️ Raquel foi removida de admin e recolocada automaticamente!`);
  } catch (e) {
    errorLog(`Erro ao proteger Raquel: ${e.message}`);
  }
}