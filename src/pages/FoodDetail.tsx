import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Info, Flame,
  ThumbsUp, ThumbsDown, Scale, Heart, Zap
} from 'lucide-react';
import { supabase, type FoodEntry } from '../lib/supabase';

type HealthConfig = {
  color: string;
  bg: string;
  border: string;
  label: string;
  icon: typeof CheckCircle;
  progressColor: string;
  ringColor: string;
  accent: string;
};

const DAILY_VALUES: Record<string, { value: number; unit: string }> = {
  fat: { value: 78, unit: 'g' },
  carbs: { value: 275, unit: 'g' },
  protein: { value: 50, unit: 'g' },
  fiber: { value: 28, unit: 'g' },
  sodium: { value: 2300, unit: 'mg' },
  sugars: { value: 50, unit: 'g' },
};

function getHealthScoreConfig(score: number): HealthConfig {
  if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Excellent Choice', icon: CheckCircle, progressColor: 'bg-green-500', ringColor: 'ring-green-400', accent: 'bg-green-500' };
  if (score >= 60) return { color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-200', label: 'Good Choice', icon: CheckCircle, progressColor: 'bg-lime-500', ringColor: 'ring-lime-400', accent: 'bg-lime-500' };
  if (score >= 40) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate', icon: AlertTriangle, progressColor: 'bg-amber-500', ringColor: 'ring-amber-400', accent: 'bg-amber-500' };
  if (score >= 20) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Poor Nutrition', icon: AlertTriangle, progressColor: 'bg-orange-500', ringColor: 'ring-orange-400', accent: 'bg-orange-500' };
  return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Unhealthy', icon: XCircle, progressColor: 'bg-red-500', ringColor: 'ring-red-400', accent: 'bg-red-500' };
}

const FOOD_IMAGES: Record<string, string> = {
  salad: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  apple: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
  banana: 'https://images.pexels.com/photos/2872783/pexels-photo-2872783.jpeg',
  chicken: 'https://images.pexels.com/photos/6287529/pexels-photo-6287529.jpeg',
  eggs: 'https://images.pexels.com/photos/14570694/pexels-photo-14570694.jpeg',
  egg: 'https://images.pexels.com/photos/14570694/pexels-photo-14570694.jpeg',
  broccoli: 'https://images.pexels.com/photos/10057348/pexels-photo-10057348.jpeg',
  steak: 'https://images.pexels.com/photos/399726/pexels-photo-399726.jpeg',
  fish: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
  rice: 'https://images.pexels.com/photos/14644834/pexels-photo-14644834.jpeg',
  pizza: 'https://images.pexels.com/photos/2762942/pexels-photo-2762942.jpeg',
  burger: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
  sandwich: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
  cereal: 'https://images.pexels.com/photos/2313528/pexels-photo-2313528.jpeg',
  oatmeal: 'https://images.pexels.com/photos/7750324/pexels-photo-7750324.jpeg',
  yogurt: 'https://images.pexels.com/photos/3768924/pexels-photo-3768924.jpeg',
  water: 'https://images.pexels.com/photos/577869/pexels-photo-577869.jpeg',
  potatoes: 'https://images.pexels.com/photos/1599670/pexels-photo-1599670.jpeg',
  carrots: 'https://images.pexels.com/photos/5249565/pexels-photo-5249565.jpeg',
  spinach: 'https://images.pexels.com/photos/216639/pexels-photo-216639.jpeg',
  avocado: 'https://images.pexels.com/photos/615704/pexels-photo-615704.jpeg',
  cheerios: 'https://images.pexels.com/photos/2313528/pexels-photo-2313528.jpeg',
  smoothie: 'https://images.pexels.com/photos/1346154/pexels-photo-1346154.jpeg',
  coke: 'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg',
  soda: 'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg',
  ham: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
  turkey: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
};

function getFoodImage(name: string): string {
  const normalizedName = name.toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (normalizedName.includes(key)) return url;
  }
  return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
}

const getDailyValuePercent = (amount: number, nutrient: keyof typeof DAILY_VALUES): number => {
  const dv = DAILY_VALUES[nutrient];
  if (!dv || dv.value === 0) return 0;
  return Math.round((amount / dv.value) * 100);
};

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function getReasonParagraphs(reason: string | null): string[] {
  if (!reason) return [];
  return reason
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function deriveProsAndCons(food: FoodEntry): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  if (food.protein_g >= 15) pros.push(`High in protein (${food.protein_g}g) — supports muscle repair and satiety.`);
  else if (food.protein_g > 0 && food.protein_g < 5) cons.push(`Low in protein (${food.protein_g}g) — pair with a protein source for balance.`);

  if (food.fiber_g >= 5) pros.push(`Good source of fiber (${food.fiber_g}g) — aids digestion and steady energy.`);
  else if (food.fiber_g < 2) cons.push(`Low fiber (${food.fiber_g}g) — add whole grains or produce to improve this.`);

  if (food.sugars_g >= 20) cons.push(`High in sugars (${food.sugars_g}g) — may spike blood sugar.`);

  if (food.fat_g >= 20) cons.push(`Higher in fat (${food.fat_g}g) — be mindful of portion size.`);
  else if (food.fat_g > 0 && food.fat_g <= 10) pros.push(`Moderate fat content (${food.fiber_g}g) — fits within a balanced day.`);

  if (food.sodium_mg >= 600) cons.push(`Sodium is on the higher side (${food.sodium_mg}mg) — watch intake if salt-sensitive.`);

  const calorieNote = food.calories <= 200
    ? `Light on calories (${food.calories}) — easy to fit into any meal plan.`
    : food.calories >= 600
      ? `Calorie-dense (${food.calories}) — best as a main meal rather than a snack.`
      : `Reasonable calorie load (${food.calories}) for a typical serving.`;
  (food.calories <= 200 || food.calories >= 600 ? pros : pros).push(calorieNote);

  const score = food.health_score || 0;
  if (score >= 80) pros.push('Overall nutrient density is strong relative to calories.');
  else if (score < 50) cons.push('Low overall nutrient density — limit frequency or balance with whole foods.');

  return { pros, cons };
}

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchFood() {
      if (!id) return;
      const { data } = await supabase
        .from('food_entries')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setFood(data);
      setLoading(false);
    }
    fetchFood();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Food Not Found</h1>
        <button onClick={() => navigate('/')} className="text-primary-500 hover:underline font-medium">
          Go Home
        </button>
      </div>
    );
  }

  const config = getHealthScoreConfig(food.health_score || 0);
  const IconComponent = config.icon;
  const reasonParagraphs = getReasonParagraphs(food.reason);
  const { pros, cons } = deriveProsAndCons(food);

  return (
    <div className="min-h-screen bg-cream pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-lg font-bold text-gray-800">Detailed View</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Food Image */}
        <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-xl mb-6">
          {!imgError ? (
            <img
              src={getFoodImage(food.name)}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center">
              <Scale className="w-20 h-20 text-primary-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${config.accent}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
              </span>
              <span className="text-white/80 text-sm capitalize">{food.meal_type}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">{food.name}</h2>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(food.created_at)}</span>
              </div>
              <span>{formatDate(food.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Health Score */}
        <div className={`rounded-2xl p-6 mb-6 ${config.bg} border-2 ${config.border}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.accent} text-white shadow-lg`}>
                <span className="text-2xl font-bold">{food.health_score}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Health Score</p>
                <p className={`text-2xl font-bold ${config.color}`}>
                  {food.health_score}/100
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <IconComponent className={`w-5 h-5 ${config.color}`} />
                <p className={`font-bold ${config.color}`}>{config.label}</p>
              </div>
            </div>
          </div>

          {/* Score Bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${config.progressColor}`}
              style={{ width: `${food.health_score}%` }}
            />
          </div>
        </div>

        {/* Rating Explanation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-800">Rating Explanation</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            The health score is a 0–100 rating that weighs calorie density, macronutrient balance,
            fiber, sodium, and added sugars. Higher scores indicate nutrient-rich choices that support
            your daily goals.
          </p>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { range: '80–100', label: 'Excellent', color: 'bg-green-100 text-green-700' },
              { range: '60–79', label: 'Good', color: 'bg-lime-100 text-lime-700' },
              { range: '40–59', label: 'Moderate', color: 'bg-amber-100 text-amber-700' },
              { range: '20–39', label: 'Poor', color: 'bg-orange-100 text-orange-700' },
              { range: '0–19', label: 'Unhealthy', color: 'bg-red-100 text-red-700' },
            ].map((tier) => (
              <div key={tier.range} className={`rounded-lg py-2 px-1 ${tier.color}`}>
                <p className="font-bold">{tier.range}</p>
                <p className="mt-0.5">{tier.label}</p>
              </div>
            ))}
          </div>
          <p className={`mt-4 text-sm font-medium ${config.color}`}>
            This item scored {food.health_score}/100, placing it in the "{config.label}" tier.
          </p>
        </div>

        {/* Why this score? (AI reason) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-800">Why This Score?</h3>
          </div>
          {reasonParagraphs.length > 0 ? (
            <div className="space-y-3">
              {reasonParagraphs.map((sentence, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${
                    (food.health_score || 0) >= 50 ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <p className="text-gray-600 leading-relaxed">{sentence}{sentence.endsWith('.') ? '' : '.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No detailed analysis available for this item.</p>
          )}
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Why It&apos;s Good</h3>
            </div>
            {pros.length > 0 ? (
              <ul className="space-y-2">
                {pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No notable benefits.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Why It&apos;s Bad</h3>
            </div>
            {cons.length > 0 ? (
              <ul className="space-y-2">
                {cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-500 italic">No major concerns.</p>
            )}
          </div>
        </div>

        {/* Nutrition Label */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-6 h-6" />
              Nutrition Facts
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between border-b-8 border-gray-900 pb-2 mb-3">
              <div>
                <p className="text-xl font-bold text-gray-800">{food.name}</p>
                <p className="text-sm text-gray-500">Amount Per Serving</p>
              </div>
            </div>

            {/* Calories Highlight */}
            <div className="flex items-end justify-between border-b-4 border-gray-900 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-4xl font-bold text-gray-900">{food.calories}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 pb-1">per serving</p>
            </div>

            <p className="text-xs text-gray-400 text-right mb-3">% Daily Value based on a 2,000 cal diet</p>

            {/* Detailed Nutrition Label Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {[
                { label: 'Total Fat', amount: food.fat_g, unit: 'g', nutrient: 'fat' as const },
                { label: 'Total Carbohydrates', amount: food.carbs_g, unit: 'g', nutrient: 'carbs' as const },
                { label: 'Protein', amount: food.protein_g, unit: 'g', nutrient: 'protein' as const },
                { label: 'Dietary Fiber', amount: food.fiber_g, unit: 'g', nutrient: 'fiber' as const },
                { label: 'Sugars', amount: food.sugars_g, unit: 'g', nutrient: 'sugars' as const },
                { label: 'Sodium', amount: food.sodium_mg, unit: 'mg', nutrient: 'sodium' as const },
              ].map((row, idx) => {
                const pct = getDailyValuePercent(row.amount, row.nutrient);
                const isHigh = pct >= 20;
                const isLow = pct > 0 && pct < 5;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-4 py-3 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${idx < 5 ? 'border-b border-gray-200' : ''}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{row.label}</p>
                      <p className="text-xs text-gray-500">{row.amount}{row.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-orange-500' : isLow ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${isHigh ? 'text-orange-600' : isLow ? 'text-green-600' : 'text-gray-700'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Low (&lt;5% DV)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>High (≥20% DV)</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Nutrition values are estimates based on typical serving sizes.
                <br />Actual values may vary depending on preparation and brand.
              </p>
            </div>
          </div>
        </div>

        {/* Macro balance summary */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Scale className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Fat</p>
            <p className="text-lg font-bold text-gray-800">{food.fat_g}g</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Zap className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Carbs</p>
            <p className="text-lg font-bold text-gray-800">{food.carbs_g}g</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <Heart className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Protein</p>
            <p className="text-lg font-bold text-gray-800">{food.protein_g}g</p>
          </div>
        </div>
      </main>
    </div>
  );
}
