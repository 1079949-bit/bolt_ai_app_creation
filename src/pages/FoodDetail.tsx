import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, AlertTriangle, CheckCircle, XCircle, Info, Flame,
  ThumbsUp, ThumbsDown, Scale, Heart, Zap, Pencil, Save, X,
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
  gradient: string;
};

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

const DAILY_VALUES: Record<string, { value: number; unit: string }> = {
  fat: { value: 78, unit: 'g' },
  carbs: { value: 275, unit: 'g' },
  protein: { value: 50, unit: 'g' },
  fiber: { value: 28, unit: 'g' },
  sodium: { value: 2300, unit: 'mg' },
  sugars: { value: 50, unit: 'g' },
};

function getHealthScoreConfig(score: number): HealthConfig {
  if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50/80', border: 'border-green-200/60', label: 'Excellent Choice', icon: CheckCircle, progressColor: 'bg-gradient-to-r from-green-400 to-green-600', ringColor: 'ring-green-400', accent: 'bg-gradient-to-br from-green-400 to-green-600', gradient: 'from-green-400 to-emerald-600' };
  if (score >= 60) return { color: 'text-lime-600', bg: 'bg-lime-50/80', border: 'border-lime-200/60', label: 'Good Choice', icon: CheckCircle, progressColor: 'bg-gradient-to-r from-lime-400 to-lime-600', ringColor: 'ring-lime-400', accent: 'bg-gradient-to-br from-lime-400 to-lime-600', gradient: 'from-lime-400 to-green-600' };
  if (score >= 40) return { color: 'text-amber-600', bg: 'bg-amber-50/80', border: 'border-amber-200/60', label: 'Moderate', icon: AlertTriangle, progressColor: 'bg-gradient-to-r from-amber-400 to-amber-600', ringColor: 'ring-amber-400', accent: 'bg-gradient-to-br from-amber-400 to-amber-600', gradient: 'from-amber-400 to-orange-600' };
  if (score >= 20) return { color: 'text-orange-600', bg: 'bg-orange-50/80', border: 'border-orange-200/60', label: 'Poor Nutrition', icon: AlertTriangle, progressColor: 'bg-gradient-to-r from-orange-400 to-orange-600', ringColor: 'ring-orange-400', accent: 'bg-gradient-to-br from-orange-400 to-orange-600', gradient: 'from-orange-400 to-red-600' };
  return { color: 'text-red-600', bg: 'bg-red-50/80', border: 'border-red-200/60', label: 'Unhealthy', icon: XCircle, progressColor: 'bg-gradient-to-r from-red-400 to-red-600', ringColor: 'ring-red-400', accent: 'bg-gradient-to-br from-red-400 to-red-600', gradient: 'from-red-400 to-rose-600' };
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

type NutritionValues = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugars_g: number;
  sodium_mg: number;
  health_score: number;
};

function deriveReason(f: NutritionValues): string {
  const parts: string[] = [];
  if (f.calories <= 200) parts.push(`At ${f.calories} calories, this is a light choice that fits easily into any meal plan.`);
  else if (f.calories >= 600) parts.push(`At ${f.calories} calories, this is calorie-dense and best as a main meal rather than a snack.`);
  else parts.push(`At ${f.calories} calories, this has a reasonable calorie load for a typical serving.`);
  if (f.protein_g >= 15) parts.push(`High in protein (${f.protein_g}g), which supports muscle repair and satiety.`);
  else if (f.protein_g > 0 && f.protein_g < 5) parts.push(`It doesn't have enough protein (${f.protein_g}g) — pair it with a protein source for balance.`);
  if (f.fiber_g >= 5) parts.push(`Good source of fiber (${f.fiber_g}g), aiding digestion and steady energy.`);
  else if (f.fiber_g < 2) parts.push(`Low in fiber (${f.fiber_g}g) — add whole grains or produce to improve this.`);
  if (f.sugars_g >= 20) parts.push(`High in sugars (${f.sugars_g}g), which may spike blood sugar.`);
  if (f.fat_g >= 20) parts.push(`Higher in fat (${f.fat_g}g) — be mindful of portion size.`);
  else if (f.fat_g > 0 && f.fat_g <= 10) parts.push(`Moderate fat content (${f.fat_g}g), fitting within a balanced day.`);
  if (f.sodium_mg >= 600) parts.push(`Sodium is on the higher side (${f.sodium_mg}mg) — watch intake if salt-sensitive.`);
  return parts.join(' ');
}

function deriveProsAndCons(f: NutritionValues): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];
  if (f.protein_g >= 15) pros.push(`High in protein (${f.protein_g}g) — supports muscle repair and satiety.`);
  else if (f.protein_g > 0 && f.protein_g < 5) cons.push(`Low in protein (${f.protein_g}g) — pair with a protein source for balance.`);
  if (f.fiber_g >= 5) pros.push(`Good source of fiber (${f.fiber_g}g) — aids digestion and steady energy.`);
  else if (f.fiber_g < 2) cons.push(`Low fiber (${f.fiber_g}g) — add whole grains or produce to improve this.`);
  if (f.sugars_g >= 20) cons.push(`High in sugars (${f.sugars_g}g) — may spike blood sugar.`);
  if (f.fat_g >= 20) cons.push(`Higher in fat (${f.fat_g}g) — be mindful of portion size.`);
  else if (f.fat_g > 0 && f.fat_g <= 10) pros.push(`Moderate fat content (${f.fat_g}g) — fits within a balanced day.`);
  if (f.sodium_mg >= 600) cons.push(`Sodium is on the higher side (${f.sodium_mg}mg) — watch intake if salt-sensitive.`);
  if (f.calories <= 200) pros.push(`Light on calories (${f.calories}) — easy to fit into any meal plan.`);
  else if (f.calories >= 600) pros.push(`Calorie-dense (${f.calories}) — best as a main meal rather than a snack.`);
  else pros.push(`Reasonable calorie load (${f.calories}) for a typical serving.`);
  const score = f.health_score || 0;
  if (score >= 80) pros.push('Overall nutrient density is strong relative to calories.');
  else if (score < 50) cons.push('Low overall nutrient density — limit frequency or balance with whole foods.');
  return { pros, cons };
}

function getReasonParagraphs(reason: string | null): string[] {
  if (!reason) return [];
  return reason
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

const EDITABLE_FIELDS: { key: keyof NutritionValues; label: string; unit: string; step: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'cal', step: '1' },
  { key: 'protein_g', label: 'Protein', unit: 'g', step: '0.1' },
  { key: 'fat_g', label: 'Total Fat', unit: 'g', step: '0.1' },
  { key: 'carbs_g', label: 'Carbohydrates', unit: 'g', step: '0.1' },
  { key: 'fiber_g', label: 'Dietary Fiber', unit: 'g', step: '0.1' },
  { key: 'sugars_g', label: 'Sugars', unit: 'g', step: '0.1' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg', step: '1' },
  { key: 'health_score', label: 'Health Score', unit: '/100', step: '1' },
];

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState<FoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<NutritionValues | null>(null);
  const [imgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100 animate-pulse-ring" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 font-display">Food Not Found</h1>
        <button onClick={() => navigate('/')} className="text-primary-500 hover:underline font-medium">
          Go Home
        </button>
      </div>
    );
  }

  const startEdit = () => {
    setEditValues({
      calories: food.calories,
      protein_g: food.protein_g,
      fat_g: food.fat_g,
      carbs_g: food.carbs_g,
      fiber_g: food.fiber_g,
      sugars_g: food.sugars_g,
      sodium_mg: food.sodium_mg,
      health_score: food.health_score || 0,
    });
    setEditing(true);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditValues(null);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editValues || !food) return;
    setSaving(true);
    setSaveError(null);
    const newReason = deriveReason(editValues);
    const { data, error } = await supabase
      .from('food_entries')
      .update({
        calories: editValues.calories,
        protein_g: editValues.protein_g,
        fat_g: editValues.fat_g,
        carbs_g: editValues.carbs_g,
        fiber_g: editValues.fiber_g,
        sugars_g: editValues.sugars_g,
        sodium_mg: editValues.sodium_mg,
        health_score: editValues.health_score,
        reason: newReason,
      })
      .eq('id', food.id)
      .select()
      .maybeSingle();

    if (error) {
      setSaveError('Failed to save changes. Please try again.');
      setSaving(false);
      return;
    }
    if (data) {
      setFood(data);
      setEditing(false);
      setEditValues(null);
    }
    setSaving(false);
  };

  const displayValues: NutritionValues = editing && editValues
    ? editValues
    : {
        calories: food.calories,
        protein_g: food.protein_g,
        fat_g: food.fat_g,
        carbs_g: food.carbs_g,
        fiber_g: food.fiber_g,
        sugars_g: food.sugars_g,
        sodium_mg: food.sodium_mg,
        health_score: food.health_score || 0,
      };

  const config = getHealthScoreConfig(displayValues.health_score || 0);
  const IconComponent = config.icon;
  const liveReason = editing && editValues ? deriveReason(editValues) : food.reason;
  const reasonParagraphs = getReasonParagraphs(liveReason);
  const { pros, cons } = deriveProsAndCons(displayValues);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-white/50 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors font-semibold group"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
          <h1 className="text-lg font-bold text-gray-800 font-display">Detailed View</h1>
          {!editing ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 transition-colors font-semibold text-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors font-semibold text-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600 transition-colors font-semibold text-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Food Image Hero */}
        <div className="relative w-full h-72 rounded-3xl overflow-hidden shadow-xl mb-6 group">
          {!imgError ? (
            <img
              src={getFoodImage(food.name)}
              alt={food.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
              <Scale className="w-20 h-20 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${config.accent} shadow-lg`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.label}
              </span>
              <span className="text-white/80 text-sm capitalize bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">{food.meal_type}</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1 font-display tracking-tight">{food.name}</h2>
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(food.created_at)}</span>
              </div>
              <span>{formatDate(food.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Edit Mode Form */}
        {editing && editValues && (
          <div className="surface p-6 mb-6 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-primary-500" />
              <h3 className="text-lg font-semibold text-gray-800 font-display">Edit Nutrition Values</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Correct any inaccurate values. The health analysis below will update automatically to match.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {EDITABLE_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    {field.label} ({field.unit})
                  </label>
                  <input
                    type="number"
                    step={field.step}
                    min="0"
                    value={editValues[field.key]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditValues({ ...editValues, [field.key]: Math.max(0, val) });
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              ))}
            </div>
            {saveError && <p className="text-sm text-red-500 mt-4">{saveError}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Health Score */}
        <div className={`rounded-3xl p-6 mb-6 ${config.bg} border-2 ${config.border} animate-fade-up`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.accent} text-white shadow-lg`}>
                <span className="text-2xl font-bold tabular-nums">{displayValues.health_score}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Health Score</p>
                <p className={`text-2xl font-bold ${config.color} tabular-nums`}>
                  {displayValues.health_score}/100
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
          <div className="w-full h-4 bg-gray-200/60 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${config.progressColor}`}
              style={{ width: `${displayValues.health_score}%` }}
            />
          </div>
        </div>

        {/* Rating Explanation */}
        <div className="surface p-6 mb-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-800 font-display">Rating Explanation</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            The health score is a 0–100 rating that weighs calorie density, macronutrient balance,
            fiber, sodium, and added sugars. Higher scores indicate nutrient-rich choices that support
            your daily goals.
          </p>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { range: '80–100', label: 'Excellent', color: 'bg-green-100/80 text-green-700' },
              { range: '60–79', label: 'Good', color: 'bg-lime-100/80 text-lime-700' },
              { range: '40–59', label: 'Moderate', color: 'bg-amber-100/80 text-amber-700' },
              { range: '20–39', label: 'Poor', color: 'bg-orange-100/80 text-orange-700' },
              { range: '0–19', label: 'Unhealthy', color: 'bg-red-100/80 text-red-700' },
            ].map((tier) => (
              <div key={tier.range} className={`rounded-lg py-2 px-1 ${tier.color} hover:scale-105 transition-transform cursor-default`}>
                <p className="font-bold">{tier.range}</p>
                <p className="mt-0.5">{tier.label}</p>
              </div>
            ))}
          </div>
          <p className={`mt-4 text-sm font-medium ${config.color}`}>
            This item scored {displayValues.health_score}/100, placing it in the "{config.label}" tier.
          </p>
        </div>

        {/* Why this score? */}
        <div className="surface p-6 mb-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-800 font-display">Why This Score?</h3>
            {editing && (
              <span className="text-xs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full ml-auto">Live preview</span>
            )}
          </div>
          {reasonParagraphs.length > 0 ? (
            <div className="space-y-3">
              {reasonParagraphs.map((sentence, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${
                    (displayValues.health_score || 0) >= 50 ? 'bg-green-500' : 'bg-orange-500'
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
          <div className="surface p-6 border-green-100/80 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 font-display">Why It&apos;s Good</h3>
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

          <div className="surface p-6 border-red-100/80 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 font-display">Why It&apos;s Bad</h3>
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
        <div className="surface overflow-hidden animate-fade-up">
          <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4`}>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
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
            <div className="flex items-end justify-between border-b-4 border-gray-900 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-4xl font-bold text-gray-900 tabular-nums">{displayValues.calories}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 pb-1">per serving</p>
            </div>
            <p className="text-xs text-gray-400 text-right mb-3">% Daily Value based on a 2,000 cal diet</p>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {[
                { label: 'Total Fat', amount: displayValues.fat_g, unit: 'g', nutrient: 'fat' as const },
                { label: 'Total Carbohydrates', amount: displayValues.carbs_g, unit: 'g', nutrient: 'carbs' as const },
                { label: 'Protein', amount: displayValues.protein_g, unit: 'g', nutrient: 'protein' as const },
                { label: 'Dietary Fiber', amount: displayValues.fiber_g, unit: 'g', nutrient: 'fiber' as const },
                { label: 'Sugars', amount: displayValues.sugars_g, unit: 'g', nutrient: 'sugars' as const },
                { label: 'Sodium', amount: displayValues.sodium_mg, unit: 'mg', nutrient: 'sodium' as const },
              ].map((row, idx) => {
                const pct = getDailyValuePercent(row.amount, row.nutrient);
                const isHigh = pct >= 20;
                const isLow = pct > 0 && pct < 5;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-4 py-3 ${idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} ${idx < 5 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{row.label}</p>
                      <p className="text-xs text-gray-500 tabular-nums">{row.amount}{row.unit}</p>
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
                      <span className={`text-sm font-bold w-12 text-right tabular-nums ${isHigh ? 'text-orange-600' : isLow ? 'text-green-600' : 'text-gray-700'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

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
          <div className="surface p-4 text-center surface-hover">
            <Scale className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Fat</p>
            <p className="text-lg font-bold text-gray-800 tabular-nums">{displayValues.fat_g}g</p>
          </div>
          <div className="surface p-4 text-center surface-hover">
            <Zap className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Carbs</p>
            <p className="text-lg font-bold text-gray-800 tabular-nums">{displayValues.carbs_g}g</p>
          </div>
          <div className="surface p-4 text-center surface-hover">
            <Heart className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Protein</p>
            <p className="text-lg font-bold text-gray-800 tabular-nums">{displayValues.protein_g}g</p>
          </div>
        </div>
      </main>
    </div>
  );
}
