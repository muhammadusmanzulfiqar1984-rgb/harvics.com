import { Request, Response } from 'express';
import { CountryRuleEngine } from '../../services/engines/countryRuleEngine';

const ruleEngine = new CountryRuleEngine();

export const getCountryProfile = (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    const profile = ruleEngine.getProfile(countryCode);
    if (!profile) {
      return res.status(404).json({ error: 'Country profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching country profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkflowConfig = (req: Request, res: Response) => {
  try {
    const { countryCode } = req.params;
    const { orderValue, productCategory } = req.query;

    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    const value = Number(orderValue) || 0;
    const category = String(productCategory || '');

    const workflow = ruleEngine.generateWorkflow(countryCode, value, category);
    res.json(workflow);
  } catch (error: any) {
    console.error('Error generating workflow:', error);
    res.status(400).json({ error: error.message });
  }
};
