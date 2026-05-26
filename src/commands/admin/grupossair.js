import { PREFIX } from "../../config.js";

export default {
  name: "grupos-pequenos",
  description: "Lista e sai de grupos com poucos membros.",
  commands: ["grupospequenos", "gpp", "sairpequenos"],
  usage: `${PREFIX}gpp\n${PREFIX}gpp sair`,

  handle: async ({ args, socket, sendReply, sendSuccessReact }) => {
    const action = args[0]?.toLowerCase();

    try {
      const chats = await socket.groupFetchAllParticipating();
      const grupos = Object.values(chats);
      
      // Filtra grupos com 3 membros ou menos
      const pequenos = grupos.filter(g => {
        const membros = g.participants?.length || g.size || 0;
        return membros <= 3;
      });

      if (pequenos.length === 0) {
        return sendReply("✅ Nenhum grupo com 3 membros ou menos!");
      }

      if (action === "sair") {
        await sendReply(`🚪 Saindo de ${pequenos.length} grupos pequenos...`);
        let saidos = 0;
        for (const g of pequenos) {
          try {
            await socket.groupLeave(g.id);
            saidos++;
            await new Promise(r => setTimeout(r, 1000));
          } catch (e) {}
        }
        await sendSuccessReact();
        return sendReply(`✅ Saí de ${saidos}/${pequenos.length} grupos pequenos!`);
      }

      // Listar
      let msg = `📊 *GRUPOS PEQUENOS (≤3 membros): ${pequenos.length}*\n\n`;
      pequenos.forEach((g, i) => {
        const membros = g.participants?.length || g.size || 0;
        msg += `${i + 1}. *${g.subject || "Sem nome"}*\n`;
        msg += `   👥 ${membros} membros\n`;
        msg += `   🆔 \`${g.id}\`\n\n`;
      });
      msg += `💡 Use \`${PREFIX}gpp sair\` para sair de todos!`;

      return sendReply(msg);
    } catch (e) {
      return sendReply(`❌ Erro: ${e.message}`);
    }
  },
};