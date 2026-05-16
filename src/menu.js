/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import pkg from "../package.json" with { type: "json" };
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";

export function menuMessage(groupJid) {
  const date = new Date();

  const prefix = getPrefix(groupJid);

  return `╭━━⪩ ${BOT_NAME} ⪨━━${readMore()}
▢
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${prefix}
▢ • Versão: ${pkg.version}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢
▢ • ${prefix}set-prefix
▢ • ${prefix}set-menu-image
▢ • ${prefix}off
▢ • ${prefix}on
▢
╰━━─「👑」─━━

╭━━⪩ ADMIN ⪨━━
▢
▢ • ${prefix}welcome (1/0)
▢ • ${prefix}set-welcome
▢ • ${prefix}agendar-grupo
▢ • ${prefix}abrir
▢ • ${prefix}fechar
▢ • ${prefix}ban
▢ • ${prefix}mute
▢ • ${prefix}unmute
▢ • ${prefix}delete
▢ • ${prefix}limpar
▢ • ${prefix}hidetag
▢ • ${prefix}promover
▢ • ${prefix}rebaixar
▢ • ${prefix}revelar
▢ • ${prefix}link-grupo
▢ • ${prefix}exit (1/0)
▢ • ${prefix}anti-link (1/0)
▢ • ${prefix}only-admin (1/0)
▢
╰━━─「⚙️」─━━

╭━━⪩ MEMBROS ⪨━━
▢
▢ • ${prefix}menu
▢ • ${prefix}ping
▢ • ${prefix}info
▢ • ${prefix}perfil
▢ • ${prefix}meu-lid
▢ • ${prefix}sticker
▢ • ${prefix}to-image
▢ • ${prefix}to-gif
▢ • ${prefix}to-mp3
▢ • ${prefix}attp
▢ • ${prefix}ttp
▢ • ${prefix}rename
▢ • ${prefix}fake-chat
▢ • ${prefix}gerar-link
▢ • ${prefix}suporte
▢
╰━━─「👥」─━━

╭━━⪩ DIVERSÃO ⪨━━
▢
▢ • ${prefix}abracar
▢ • ${prefix}beijar
▢ • ${prefix}dado
▢ • ${prefix}jantar
▢ • ${prefix}lutar
▢ • ${prefix}matar
▢ • ${prefix}socar
▢
╰━━─「🎡」─━━

╭━━⪩ DOWNLOADS ⪨━━
▢
▢ • ${prefix}facebook
▢ • ${prefix}instagram
▢ • ${prefix}tik-tok
▢ • ${prefix}yt-mp3
▢ • ${prefix}yt-mp4
▢ • ${prefix}play-audio
▢ • ${prefix}play-video
▢
╰━━─「📥」─━━`;
}
