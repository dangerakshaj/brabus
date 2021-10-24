const { SlashCommand } = require("@src/structures");
const { CommandInteraction } = require("discord.js");
const { checkMusic } = require("@utils/botUtils");

module.exports = class Pause extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pause the current song",
      enabled: true,
      category: "MUSIC",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const player = interaction.client.musicManager.get(interaction.guildId);

    const playable = checkMusic(member, player);
    if (typeof playable !== "boolean") return interaction.followUp(playable);

    if (player.paused) return interaction.followUp("The player is already paused.");

    player.pause(true);
    await interaction.followUp("> ⏸️ Paused the music player.");
  }
};