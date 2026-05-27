import { PREFIX } from "../../config.js";

export default {
  name: "play-musica",
  description: "Pesquisa e envia música em formato de áudio.",
  commands: ["play-musica", "play", "musica", "tocar"],
  usage: `${PREFIX}play | nome da música`,

  handle: async ({ args, sendReply, sendWaitReply, sendErrorReply, sendSuccessReact, socket, remoteJid }) => {
    const musica = args.join(" ").trim();

    if (!musica || musica.length < 2) {
      return sendErrorReply("❌ Digite o nome da música!\nEx: `/play | alone`");
    }

    await sendWaitReply("🔍 Procurando música...");

    try {
      // Busca no YouTube
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(musica + " audio")}`;
      const searchRes = await fetch(searchUrl);
      const html = await searchRes.text();

      // Extrai o ID do vídeo
      const videoId = html.match(/\/watch\?v=([a-zA-Z0-9_-]+)/)?.[1];

      if (!videoId) {
        return sendErrorReply("❌ Música não encontrada!");
      }

      await sendReply("🎵 Baixando música...");

      // Usa API gratuita para converter
      const apiUrl = `https://api.akuari.my.id/downloader/ytmp3?link=https://youtube.com/watch?v=${videoId}`;
      const apiRes = await fetch(apiUrl);
      const data = await apiRes.json();

      if (data?.status === 200 && data?.result?.download) {
        await sendSuccessReact();
        await socket.sendMessage(remoteJid, {
          audio: { url: data.result.download },
          mimetype: "audio/mpeg",
          fileName: `${data.result.title || "musica"}.mp3`
        });
        await sendReply(`🎵 *${data.result.title || "Música"}*`);
      } else {
        return sendErrorReply("❌ Não foi possível baixar a música. Tente outra!");
      }
    } catch (error) {
      return sendErrorReply(`❌ Erro: ${error.message}`);
    }
  },
};