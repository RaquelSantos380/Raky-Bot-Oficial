/**
 * Menu do bot
 *
 * @author Dev Gui
 */
import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
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
▢ • ${prefix}anti-link-warn (1/0)
▢ • ${prefix}anti-flood (1/0)
▢ • ${prefix}bloquear-palavra
▢ • ${prefix}lista-negra
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
▢ • ${prefix}suporte
▢
╰━━─「👥」─━━

╭━━⪩ DIVERSÃO ⪨━━
▢
▢ • ${prefix}abracar @user
▢ • ${prefix}beijar @user
▢ • ${prefix}dado
▢ • ${prefix}jantar @user
▢ • ${prefix}lutar @user
▢ • ${prefix}matar @user
▢ • ${prefix}socar @user
▢ • ${prefix}velha — Inicia jogo da velha
▢ • ${prefix}velha entrar — Entra no jogo
▢ • ${prefix}velha jogar | 1 — Joga
▢ • ${prefix}forca iniciar
▢ • ${prefix}forca l | a
▢ • ${prefix}forca chutar | palavra
▢ • ${prefix}animal
▢ • ${prefix}animal chutar | nome
▢ • ${prefix}pensao | @user | motivo
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
╰━━─「📥」─━━

⚠️ Use | para separar os argumentos!`;
}
