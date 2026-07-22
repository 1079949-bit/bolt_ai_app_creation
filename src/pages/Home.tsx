import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Trash2, ChevronDown, ChevronUp, TrendingUp, User2, Pill, Utensils, Flame } from 'lucide-react';
import { supabase, type FoodEntry, type Biometrics, type DailyTarget, type VitaminTarget } from '../lib/supabase';
import FoodScanner from '../components/FoodScanner';

export default function Home() {
  const navigate = useNavigate();
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [biometrics, setBiometrics] = useState<Biometrics | null>(null);
  const [targets, setTargets] = useState<DailyTarget | null>(null);
  const [vitamins, setVitamins] = useState<VitaminTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [showBiometricsModal, setShowBiometricsModal] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [foodRes, bioRes, targetRes, vitaminRes] = await Promise.all([
        supabase.from('food_entries').select('*').eq('log_date', todayStr).order('created_at'),
        supabase.from('biometrics').select('*').maybeSingle(),
        supabase.from('daily_targets').select('*').maybeSingle(),
        supabase.from('vitamin_targets').select('*').maybeSingle()
      ]);

      if (foodRes.data) setFoodEntries(foodRes.data);
      if (bioRes.data) setBiometrics(bioRes.data);
      if (targetRes.data) setTargets(targetRes.data);
      if (vitaminRes.data) setVitamins(vitaminRes.data);
      setLoading(false);
    }
    fetchData();
  }, [todayStr]);

  const calculateBMI = () => {
    if (!biometrics?.height_ft || !biometrics?.weight_lbs) return null;
    const totalInches = (biometrics.height_ft * 12) + (biometrics.height_in || 0);
    return ((biometrics.weight_lbs / (totalInches * totalInches)) * 703).toFixed(1);
  };

  const getDailyTotals = () => {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };
    foodEntries.forEach(entry => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.protein_g || 0;
      totals.fat += entry.fat_g || 0;
      totals.carbs += entry.carbs_g || 0;
      totals.fiber += entry.fiber_g || 0;
    });
    return totals;
  };

  const meals = {
    breakfast: foodEntries.filter(e => e.meal_type === 'breakfast'),
    lunch: foodEntries.filter(e => e.meal_type === 'lunch'),
    dinner: foodEntries.filter(e => e.meal_type === 'dinner')
  };

  const totals = getDailyTotals();

  const handleScanComplete = (entry: FoodEntry) => {
    setFoodEntries([...foodEntries, entry]);
    setShowScanner(false);
  };

  const deleteFood = async (id: string) => {
    await supabase.from('food_entries').delete().eq('id', id);
    setFoodEntries(foodEntries.filter(e => e.id !== id));
  };

  const updateBiometrics = async (data: Partial<Biometrics>) => {
    if (!biometrics) return;
    const { data: updated } = await supabase
      .from('biometrics')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', biometrics.id)
      .select()
      .maybeSingle();
    if (updated) setBiometrics(updated);
    setShowBiometricsModal(false);
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50/80 border-green-200/60';
    if (score >= 50) return 'bg-amber-50/80 border-amber-200/60';
    return 'bg-red-50/80 border-red-200/60';
  };

  const getProgressColor = (current: number, target: number) => {
    const percent = (current / target) * 100;
    if (percent <= 50) return 'bg-primary-500';
    if (percent <= 85) return 'bg-amber-500';
    return 'bg-green-500';
  };

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

  const mealIcons: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
  const mealColors: Record<string, string> = {
    breakfast: 'from-amber-400 to-orange-400',
    lunch: 'from-green-400 to-emerald-400',
    dinner: 'from-blue-400 to-indigo-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-cream to-white/50 pb-32">
      {/* Header */}
      <header className="pt-10 px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient tracking-tight font-display">SnapNutrition</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-card border border-gray-100/80">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Today</span>
          </div>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div className="mx-6 mb-6 surface overflow-hidden">
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {[
            { label: 'Calories', value: totals.calories, color: 'text-primary-500', icon: Flame },
            { label: 'Protein', value: `${totals.protein}g`, color: 'text-blue-500', icon: null },
            { label: 'Fat', value: `${totals.fat}g`, color: 'text-amber-500', icon: null },
            { label: 'Carbs', value: `${totals.carbs}g`, color: 'text-orange-500', icon: null },
            { label: 'Fiber', value: `${totals.fiber}g`, color: 'text-green-500', icon: null },
          ].map((stat) => (
            <div key={stat.label} className="p-4 text-center hover:bg-gray-50/50 transition-colors">
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Biometrics Cards */}
      <div className="px-6 grid grid-cols-3 gap-4">
        {/* Daily Nutrition */}
        <div className="surface surface-hover p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Utensils className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Daily Nutrition</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Calories', current: totals.calories, target: targets?.calories || 2000, unit: '' },
              { label: 'Protein', current: totals.protein, target: targets?.protein_g || 150, unit: 'g' },
              { label: 'Carbs', current: totals.carbs, target: targets?.carbs_g || 350, unit: 'g' },
              { label: 'Fat', current: totals.fat, target: targets?.total_fat_g || 100, unit: 'g' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{item.label}</span>
                  <span className="font-medium text-gray-800 tabular-nums">{item.current}{item.unit}/{item.target}{item.unit}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.current, item.target)}`}
                    style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body Metrics */}
        <div
          className="surface surface-hover p-5 cursor-pointer"
          onClick={() => setShowBiometricsModal(true)}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User2 className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Body Metrics</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Weight</span>
              <span className="font-medium text-gray-800 tabular-nums">{biometrics?.weight_lbs || '--'} lbs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Height</span>
              <span className="font-medium text-gray-800 tabular-nums">{biometrics?.height_ft || '--'} ft {biometrics?.height_in || 0} in</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">BMI</span>
              <span className="font-medium text-gray-800 tabular-nums">{calculateBMI() || '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sodium</span>
              <span className="font-medium text-gray-800 tabular-nums">{biometrics?.sodium_mg || 2000} mg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sugars</span>
              <span className="font-medium text-gray-800 tabular-nums">{biometrics?.sugars_g || 120} g</span>
            </div>
          </div>
          <p className="text-xs text-primary-500 mt-3 font-medium">Tap to edit</p>
        </div>

        {/* Vitamins */}
        <div className="surface surface-hover p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Vitamins</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Vitamin A</span>
              <span className="font-medium text-gray-800 tabular-nums">{vitamins?.vitamin_a_mcg || 900} mcg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vitamin C</span>
              <span className="font-medium text-gray-800 tabular-nums">{vitamins?.vitamin_c_mcg || 90} mcg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vitamin D</span>
              <span className="font-medium text-gray-800 tabular-nums">{vitamins?.vitamin_d_mcg || 15} mcg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vitamin E</span>
              <span className="font-medium text-gray-800 tabular-nums">{vitamins?.vitamin_e_mg || 15} mg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vitamin B12</span>
              <span className="font-medium text-gray-800 tabular-nums">{vitamins?.vitamin_b12_mcg || 2.4} mcg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="px-6 mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 font-display">Today's Meals</h2>
        {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
          <div
            key={mealType}
            className="surface overflow-hidden"
          >
            <button
              onClick={() => setExpandedMeal(expandedMeal === mealType ? null : mealType)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mealColors[mealType]} flex items-center justify-center shadow-sm`}>
                  <span className="text-lg">{mealIcons[mealType]}</span>
                </div>
                <div className="text-left">
                  <span className="text-base font-semibold text-gray-800 capitalize">{mealType}</span>
                  <p className="text-xs text-gray-500">{meals[mealType].length} items logged</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {meals[mealType].length > 0 && (
                  <span className="text-xs font-medium text-gray-400 tabular-nums">
                    {meals[mealType].reduce((sum, e) => sum + (e.calories || 0), 0)} cal
                  </span>
                )}
                {expandedMeal === mealType ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                )}
              </div>
            </button>

            {expandedMeal === mealType && (
              <div className="px-5 pb-4 space-y-3 border-t border-gray-100/80 pt-4 animate-fade-up">
                {meals[mealType].length > 0 ? (
                  meals[mealType].map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${getHealthScoreBg(entry.health_score || 0)} cursor-pointer hover:shadow-sm transition-all group`}
                      onClick={() => navigate(`/food/${entry.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                          (entry.health_score || 0) >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          (entry.health_score || 0) >= 50 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                        }`}>
                          {entry.health_score}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{entry.name}</p>
                          <p className="text-sm text-gray-500 tabular-nums">{entry.calories} cal</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFood(entry.id);
                        }}
                        className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 rounded-xl">
                    <p className="text-gray-400">No foods logged yet</p>
                    <p className="text-sm text-gray-400 mt-1">Tap scan to add</p>
                  </div>
                )}
              </div>
            )}

            {expandedMeal !== mealType && meals[mealType].length > 0 && (
              <div className="px-5 pb-4 border-t border-gray-100/80 pt-3">
                <div className="flex flex-wrap gap-2">
                  {meals[mealType].map((entry) => (
                    <span
                      key={entry.id}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        (entry.health_score || 0) >= 80 ? 'bg-green-100/80 text-green-700' :
                        (entry.health_score || 0) >= 50 ? 'bg-amber-100/80 text-amber-700' : 'bg-red-100/80 text-red-700'
                      }`}
                    >
                      {entry.name}
                      <span className="font-bold tabular-nums">{entry.health_score}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scan Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <Camera className="w-6 h-6" />
        <span className="text-lg font-bold font-display">Scan Food</span>
      </button>

      {/* Biometrics Edit Modal */}
      {showBiometricsModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowBiometricsModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 font-display">Update Biometrics</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateBiometrics({
                  weight_lbs: parseFloat(formData.get('weight') as string) || null,
                  height_ft: parseInt(formData.get('heightFt') as string) || null,
                  height_in: parseInt(formData.get('heightIn') as string) || 0,
                  sodium_mg: parseInt(formData.get('sodium') as string) || 2000,
                  sugars_g: parseInt(formData.get('sugars') as string) || 120
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Weight (lbs)</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    defaultValue={biometrics?.weight_lbs || ''}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Sodium (mg)</label>
                  <input
                    name="sodium"
                    type="number"
                    defaultValue={biometrics?.sodium_mg || 2000}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Height (ft)</label>
                  <input
                    name="heightFt"
                    type="number"
                    defaultValue={biometrics?.height_ft || ''}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Height (in)</label>
                  <input
                    name="heightIn"
                    type="number"
                    max="11"
                    defaultValue={biometrics?.height_in || 0}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Sugars (g)</label>
                  <input
                    name="sugars"
                    type="number"
                    defaultValue={biometrics?.sugars_g || 120}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Food Scanner */}
      {showScanner && (
        <FoodScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
          todayStr={todayStr}
        />
      )}
    </div>
  );
}
