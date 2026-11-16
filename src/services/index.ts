/**
 * Service registry — the single place where mock adapters are wired in.
 * Swap any of these for production implementations without touching UI code.
 */
import { ruleBasedEngine, type RecommendationEngine } from "./recommendation/engine";
import { localStorageAdapter } from "./persistence/localStorageAdapter";
import type { PersistenceAdapter } from "./persistence/adapter";
import { mockRecognition, type RecognitionService } from "./images/recognition";
import { browserImageService, type ImageService } from "./images/imageService";
import { simulatedLookVisualizer, type LookVisualizer } from "./visualization/visualizer";

export interface Services {
  engine: RecommendationEngine;
  persistence: PersistenceAdapter;
  recognition: RecognitionService;
  images: ImageService;
  visualizer: LookVisualizer;
}

export const services: Services = {
  engine: ruleBasedEngine,
  persistence: localStorageAdapter,
  recognition: mockRecognition,
  images: browserImageService,
  visualizer: simulatedLookVisualizer,
};
