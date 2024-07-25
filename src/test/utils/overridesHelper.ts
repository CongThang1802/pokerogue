import { Weather, WeatherType } from "#app/data/weather";
import { Biome } from "#app/enums/biome";
import * as GameMode from "#app/game-mode";
import { GameModes, getGameMode } from "#app/game-mode";
import Overrides from "#app/overrides";
import GameManager from "#test/utils/gameManager";
import { vi } from "vitest";

/**
 * Helper to handle overrides in tests
 */
export class OverridesHelper {
  private readonly game: GameManager;

  constructor(game: GameManager) {
    this.game = game;
  }

  /**
   * Override the starting biome
   * @warning Any event listeners that are attached to [NewArenaEvent](events\battle-scene.ts) may need to be handled down the line
   * @param biome the biome to set
   */
  startingBiome(biome: Biome): this {
    this.game.scene.newArena(biome);
    this.log(`Starting biome set to ${Biome[biome]} (=${biome})!`);
    return this;
  }

  /**
   * Override the starting wave (index)
   * @param wave the wave (index) to set. Classic: `1`-`200`
   * @returns spy instance
   */
  startingWave(wave: number): this {
    vi.spyOn(Overrides, "STARTING_WAVE_OVERRIDE", "get").mockReturnValue(wave);
    this.log(`Starting wave set to ${wave}!`);
    return this;
  }

  /**
   * Override each wave to have or not have standard trainer battles
   * @returns spy instance
   * @param disable - true
   */
  disableTrainerWaves(disable: boolean): this {
    const realFn = getGameMode;
    vi.spyOn(GameMode, "getGameMode").mockImplementation((gameMode: GameModes) => {
      const mode = realFn(gameMode);
      mode.hasTrainers = !disable;
      return mode;
    });
    this.log(`Standard trainer waves are ${disable ? "disabled" : "enabled"}!`);
    return this;
  }

  /**
   * Override the weather (type)
   * @param type weather type to set
   * @returns spy instance
   */
  weather(type: WeatherType): this {
    vi.spyOn(Overrides, "WEATHER_OVERRIDE", "get").mockReturnValue(type);
    this.log(`Weather set to ${Weather[type]} (=${type})!`);
    return this;
  }

  /**
   * Override the seed
   * @param seed the seed to set
   * @returns spy instance
   */
  seed(seed: string): this {
    vi.spyOn(this.game.scene, "resetSeed").mockImplementation(() => {
      this.game.scene.waveSeed = seed;
      Phaser.Math.RND.sow([seed]);
      this.game.scene.rngCounter = 0;
    });
    this.game.scene.resetSeed();
    this.log(`Seed set to "${seed}"!`);
    return this;
  }

  private log(...params: any[]) {
    console.log("Overrides:", ...params);
  }
}
