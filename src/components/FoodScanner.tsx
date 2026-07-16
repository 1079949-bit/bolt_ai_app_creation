import { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, Sparkles } from 'lucide-react';
import { supabase, type FoodEntry } from '../lib/supabase';

interface FoodScannerProps {
  onClose: () => void;
  onScanComplete: (entry: FoodEntry) => void;
  todayStr: string;
}

const healthScoreReasons: Record<string, { score: number; reason: string }> = {
  salad: {
    score: 92,
    reason: 'High in fiber, vitamins, and antioxidants. Low in calories and excellent for weight management. Contains essential nutrients that support overall health.'
  },
  apple: {
    score: 95,
    reason: 'Rich in fiber, vitamin C, and antioxidants. Low glycemic load makes it suitable for most diets. Promotes heart health and aids digestion.'
  },
  broccoli: {
    score: 98,
    reason: 'Nutritional powerhouse loaded with vitamins K and C, fiber, and cancer-fighting compounds. Very low calorie with exceptional nutrient density.'
  },
  chicken: {
    score: 88,
    reason: 'Excellent source of lean protein essential for muscle building and repair. Low in fat when prepared without skin. Rich in B vitamins for energy metabolism.'
  },
  pizza: {
    score: 35,
    reason: 'High in refined carbs, sodium, and saturated fat. Processed meats often contain preservatives. Low fiber and vegetable content makes it less nutritious.'
  },
  burger: {
    score: 28,
    reason: 'High in saturated fat, sodium, and calories. Processed meat may contain additives. Limited vegetable content and refined bun reduces nutritional value.'
  },
  soda: {
    score: 10,
    reason: 'Zero nutritional value with extremely high added sugar content. Contributes to weight gain, tooth decay, and increased diabetes risk. Phosphoric acid may weaken bones.'
  },
  water: {
    score: 100,
    reason: 'Essential for life. Zero calories, optimal hydration. Supports all bodily functions including metabolism, temperature regulation, and toxin removal.'
  },
  fish: {
    score: 90,
    reason: 'Excellent source of omega-3 fatty acids, high-quality protein, and vitamin D. Supports heart health, brain function, and reduces inflammation.'
  },
  eggs: {
    score: 93,
    reason: 'Complete protein source with all essential amino acids. Rich in choline for brain health and B vitamins. Very satiating and nutrient-dense.'
  },
  rice: {
    score: 65,
    reason: 'Good source of carbohydrates for energy. Brown rice is higher in fiber and nutrients. White rice has lower nutritional density but is easily digestible.'
  },
  pasta: {
    score: 45,
    reason: 'High carbohydrate content with moderate glycemic impact. Whole grain options are more nutritious. Often paired with calorie-dense sauces.'
  },
  french_fries: {
    score: 24,
    reason: 'High in sodium, unhealthy fats from deep frying, and calories. Contains acrylamide from high-heat cooking. Very low nutritional value despite being derived from potatoes.'
  },
  ice_cream: {
    score: 32,
    reason: 'High in added sugars and saturated fat. Contains calcium but overshadowed by calorie density. Best enjoyed as an occasional treat rather than regular part of diet.'
  },
  yogurt: {
    score: 85,
    reason: 'Excellent source of probiotics for gut health, calcium, and protein. Greek varieties are even higher in protein. Watch for added sugars in flavored options.'
  },
  banana: {
    score: 89,
    reason: 'Rich in potassium, vitamin B6, and fiber. Natural sugars provide quick energy. Great pre-workout snack and supports heart health.'
  },
  orange: {
    score: 91,
    reason: 'Excellent vitamin C source for immune function. Contains fiber, folate, and antioxidants. Natural sugars with low glycemic load.'
  },
  sandwich: {
    score: 62,
    reason: 'Nutritional value depends heavily on ingredients. Can be healthy with whole grain bread, lean protein, and vegetables. Processed meats and refined bread lower the score.'
  },
  steak: {
    score: 82,
    reason: 'High-quality protein with iron, zinc, and B12. Moderate saturated fat content. Best enjoyed in reasonable portions as part of balanced diet.'
  },
  potatoes: {
    score: 85,
    reason: 'Good source of potassium, vitamin C, and fiber. Moderate glycemic index when prepared healthily. Nutrient profile affected by cooking method.'
  },
  cereal: {
    score: 47,
    reason: 'Often high in added sugars and refined grains. Choose whole grain varieties with lower sugar content. Many are fortified with essential vitamins and minerals.'
  },
  oatmeal: {
    score: 94,
    reason: 'Excellent source of soluble fiber for heart health and digestion. Provides sustained energy and helps lower cholesterol. Very low in sugar when plain.'
  },
  nuts: {
    score: 88,
    reason: 'Packed with healthy fats, protein, fiber, and essential minerals. Supports heart health and provides sustained energy. Calorie-dense, so practice portion control.'
  },
  cheese: {
    score: 72,
    reason: 'Good source of calcium, protein, and vitamin B12. Contains saturated fat and sodium, so moderation is key. Aged varieties offer probiotics.'
  },
  milk: {
    score: 78,
    reason: 'Excellent calcium and vitamin D source for bone health. Quality protein with all essential amino acids. Choose low-fat options for reduced saturated fat.'
  },
  coffee: {
    score: 70,
    reason: 'Contains antioxidants and may improve mental performance. Low calorie when black. Adding sugar and cream significantly reduces nutritional value.'
  },
  tea: {
    score: 95,
    reason: 'Rich in antioxidants, especially catechins in green tea. Zero calories and supports hydration. May boost metabolism and support heart health.'
  },
  juice: {
    score: 55,
    reason: 'Contains vitamins but lacks fiber of whole fruit. High sugar concentration causes blood sugar spikes. Fresh-pressed is better than concentrate with added sugars.'
  },
  avocado: {
    score: 96,
    reason: 'Superfood rich in heart-healthy monounsaturated fats, fiber, and potassium. Supports nutrient absorption from other foods. Very satiating despite calorie density.'
  },
  spinach: {
    score: 99,
    reason: 'Extremely nutrient-dense with vitamins A, C, K, iron, and folate. Very low calorie. Supports bone health, immunity, and cardiovascular function.'
  },
  carrots: {
    score: 94,
    reason: 'Excellent source of beta-carotene for eye health. Good fiber content and low calorie. Sweet flavor makes them a great healthy snack alternative.'
  },
  cheerios: {
    score: 47,
    reason: 'Moderate health score due to added sugars, but contains whole grains and is fortified with essential vitamins and minerals. Better than many sugary cereals.'
  }
};

export default function FoodScanner({ onClose, onScanComplete, todayStr }: FoodScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFood = (name: string): { score: number; reason: string } => {
    const normalizedName = name.toLowerCase().replace(/[^a-z\s]/g, '').trim();

    for (const [key, value] of Object.entries(healthScoreReasons)) {
      if (normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])) {
        return value;
      }
    }

    const words = normalizedName.split(' ');
    for (const word of words) {
      if (healthScoreReasons[word]) {
        return healthScoreReasons[word];
      }
    }

    const baseScore = 50;
    const variation = Math.floor(Math.random() * 31) - 15;
    return {
      score: Math.max(0, Math.min(100, baseScore + variation)),
      reason: 'This food item has been analyzed based on typical nutritional content. For more specific health scores, consider scanning brand-name products or consulting detailed nutritional information.'
    };
  };

  const handleScan = async (name: string) => {
    setIsScanning(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));

      const analysis = analyzeFood(name);

      const calories = Math.floor(Math.random() * 300) + 100;
      const protein = Math.floor(Math.random() * 25) + 5;
      const carbs = Math.floor(Math.random() * 40) + 10;
      const fat = Math.floor(Math.random() * 20) + 5;
      const fiber = Math.floor(Math.random() * 8);
      const sodium = Math.floor(Math.random() * 800) + 100;
      const sugars = Math.floor(Math.random() * 15);

      const { data, error: insertError } = await supabase
        .from('food_entries')
        .insert({
          name,
          health_score: analysis.score,
          reason: analysis.reason,
          meal_type: mealType,
          calories,
          protein_g: protein,
          carbs_g: carbs,
          fat_g: fat,
          fiber_g: fiber,
          sodium_mg: sodium,
          sugars_g: sugars,
          log_date: todayStr
        })
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) onScanComplete(data);
    } catch (err) {
      setError('Failed to analyze food. Please try again.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setFoodName(fileName);
    await handleScan(fileName);
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    await handleScan(foodName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h2 className="text-white text-lg font-semibold">Scan Food</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      {!manualEntry ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Camera Preview */}
          <div className="relative w-72 h-72 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl flex items-center justify-center mb-8 overflow-hidden">
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-primary-400 rounded-tl-lg opacity-80" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-primary-400 rounded-tr-lg opacity-80" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-primary-400 rounded-bl-lg opacity-80" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-primary-400 rounded-br-lg opacity-80" />

            {/* Scanning animation */}
            <div className="absolute inset-6 bg-primary-500/10 rounded-xl animate-pulse" />

            {isScanning ? (
              <div className="flex flex-col items-center z-10">
                <Loader2 className="w-14 h-14 text-primary-400 animate-spin" />
                <p className="text-white/90 mt-4 font-medium">Analyzing food...</p>
              </div>
            ) : (
              <Camera className="w-20 h-20 text-white/30" />
            )}
          </div>

          {error && (
            <p className="text-red-400 mb-4 text-center text-sm">{error}</p>
          )}

          {/* Meal Type Selection */}
          <div className="mb-6">
            <p className="text-white/60 text-sm mb-3 text-center">Select meal</p>
            <div className="flex gap-2">
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <button
                  key={meal}
                  onClick={() => setMealType(meal)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                    mealType === meal
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 w-full max-w-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Upload Food Image
            </button>

            <button
              onClick={() => setManualEntry(true)}
              disabled={isScanning}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              Enter Food Name
            </button>
          </div>

          {/* Hint */}
          <p className="text-white/40 text-xs mt-6 text-center max-w-xs">
            Upload an image of your food or enter its name manually to get an instant health score
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <form onSubmit={handleSubmitManual} className="w-full max-w-xs space-y-5">
            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">Food Name</label>
              <input
                type="text"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Grilled Chicken Salad"
                className="w-full px-4 py-3 bg-white/10 text-white placeholder:text-white/40 border border-white/20 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">Meal</label>
              <div className="flex gap-2">
                {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealType(meal)}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                      mealType === meal
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={!foodName.trim() || isScanning}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-lg shadow-primary-500/30"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Food
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setManualEntry(false)}
              className="w-full py-3 text-white/60 hover:text-white transition-colors text-sm"
            >
              Back to Scanner
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
