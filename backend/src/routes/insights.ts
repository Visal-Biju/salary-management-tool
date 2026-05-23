import { Router } from 'express';
import { getOrgSummary, getCountryStats, getJobTitleStats } from '../services/insightService';

export const insightsRouter = Router();

insightsRouter.get('/summary', async (_req, res, next) => {
  try {
    res.json(await getOrgSummary());
  } catch (err) {
    next(err);
  }
});

insightsRouter.get('/country-stats', async (_req, res, next) => {
  try {
    res.json(await getCountryStats());
  } catch (err) {
    next(err);
  }
});

insightsRouter.get('/jobtitle-stats', async (_req, res, next) => {
  try {
    res.json(await getJobTitleStats());
  } catch (err) {
    next(err);
  }
});
