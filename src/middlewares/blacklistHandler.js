import { isBlacklisted } from "../utils/database.js";
import { onlyNumbers } from "../utils/index.js";

export async function blacklistHandler(socket, remoteJid, userLid, data) {
  const number = onlyNumbers(userLid);
  const blocked = isBlacklisted(remoteJid, number);

  if (blocked) {
    try {
      await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");
    } catch (e) {}
    return true;
  }

  return false;
}