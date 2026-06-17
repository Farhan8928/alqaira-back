import { SettingsModel } from "./settings.model.js";

const settingsRepository = {
  get: () => SettingsModel.findOne().lean(),

  update: (patch) =>
    SettingsModel.findOneAndUpdate({}, { $set: patch }, { new: true, upsert: true }).lean(),

  /** Atomically bump and return the next order sequence number. */
  async nextOrderSequence() {
    const doc = await SettingsModel.findOneAndUpdate(
      {},
      { $inc: { orderSequence: 1 } },
      { new: true, upsert: true },
    ).lean();
    return doc.orderSequence;
  },
};

export { settingsRepository };
