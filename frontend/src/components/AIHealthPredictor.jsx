// frontend/src/components/AIHealthPredictor.jsx
import React, { useState, useEffect } from "react";
import { getUserData } from "../hooks/useLocalStorage";
import { API_URL } from "../config/api";

const AIHealthPredictor = () => {
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeTrends();
  }, []);

  const analyzeTrends = () => {
    const vitals = getUserData("vitals") || [];
    
    if (vitals.length < 3) {
      setLoading(false);
      return;
    }

    const last7Days = vitals.slice(-7);
    const newPredictions = [];
    const newInsights = [];

    // 1. Heart Rate Trend Analysis
    const heartRates = last7Days.map(v => Number(v.heartRate));
    const hrTrend = calculateTrend(heartRates);
    
    if (hrTrend.increasing && hrTrend.change > 10) {
      newPredictions.push({
        type: "warning",
        title: "Rising Heart Rate Pattern",
        description: `Your heart rate has increased by ${hrTrend.change.toFixed(1)} bpm over the last week`,
        prediction: "Possible stress, overexertion, or early illness in 2-3 days",
        icon: "💓",
        confidence: 75,
        actions: [
          "Ensure adequate rest and sleep",
          "Reduce physical exertion",
          "Monitor for other symptoms",
          "Consider stress management techniques"
        ]
      });
    }

    // 2. SpO₂ Declining
    const spo2Levels = last7Days.map(v => Number(v.spo2));
    const spo2Trend = calculateTrend(spo2Levels);
    
    if (spo2Trend.decreasing && spo2Trend.change > 2) {
      newPredictions.push({
        type: "danger",
        title: "Oxygen Level Declining",
        description: `SpO₂ has decreased by ${Math.abs(spo2Trend.change).toFixed(1)}% over the last week`,
        prediction: "Possible respiratory issue developing",
        icon: "🫁",
        confidence: 80,
        actions: [
          "Ensure good ventilation indoors",
          "Avoid polluted environments",
          "Practice deep breathing exercises",
          "Consult doctor if continues declining"
        ]
      });
    }

    // 3. Activity Level Drop
    const steps = last7Days.map(v => Number(v.steps));
    const stepsTrend = calculateTrend(steps);
    
    if (stepsTrend.decreasing && stepsTrend.change > 2000) {
      newPredictions.push({
        type: "warning",
        title: "Decreased Physical Activity",
        description: `Daily steps dropped by ${Math.abs(stepsTrend.change).toFixed(0)} on average`,
        prediction: "May indicate fatigue or low energy - possible illness in 1-3 days",
        icon: "🚶",
        confidence: 70,
        actions: [
          "Listen to your body - rest if needed",
          "Maintain light activity if possible",
          "Stay hydrated",
          "Monitor energy levels"
        ]
      });
    }

    // 4. Temperature Fluctuation
    const temps = last7Days.map(v => Number(v.temp));
    const tempVariance = calculateVariance(temps);
    
    if (tempVariance > 1.5) {
      newPredictions.push({
        type: "warning",
        title: "Unstable Body Temperature",
        description: `Temperature varying more than usual (±${tempVariance.toFixed(1)}°F)`,
        prediction: "May indicate immune system fighting something",
        icon: "🌡️",
        confidence: 65,
        actions: [
          "Monitor temperature regularly",
          "Stay hydrated",
          "Get adequate sleep",
          "Consider vitamin C supplementation"
        ]
      });
    }

    // 5. Positive Insights
    if (heartRates.every(hr => hr >= 60 && hr <= 100)) {
      newInsights.push({
        type: "success",
        title: "Excellent Heart Rate Stability",
        description: "Your heart rate has been consistently in the healthy range",
        icon: "✅",
        tip: "Keep up your current exercise and stress management routine!"
      });
    }

    if (steps.every(s => s >= 8000)) {
      newInsights.push({
        type: "success",
        title: "Outstanding Activity Level",
        description: "You're consistently hitting 8000+ steps daily",
        icon: "🏆",
        tip: "Your cardiovascular health is likely improving!"
      });
    }

    if (spo2Levels.every(s => s >= 95)) {
      newInsights.push({
        type: "success",
        title: "Perfect Oxygen Levels",
        description: "SpO₂ consistently above 95% - excellent respiratory health",
        icon: "💪",
        tip: "Your breathing exercises or cardio is paying off!"
      });
    }

    setPredictions(newPredictions);
    setInsights(newInsights);
    setLoading(false);
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return { increasing: false, decreasing: false, change: 0 };
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    
    return {
      increasing: change > 0,
      decreasing: change < 0,
      change: change
    };
  };

  const calculateVariance = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing your health trends...</p>
      </div>
    );
  }

  if (predictions.length === 0 && insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-8 text-center">
        <span className="text-6xl mb-4 block">🔮</span>
        <h3 className="text-xl font-bold text-gray-800 mb-2">AI Health Predictor</h3>
        <p className="text-gray-600 mb-4">
          Log vitals for at least 3 days to get AI-powered health predictions!
        </p>
        <p className="text-sm text-gray-500">
          The more data you log, the more accurate predictions become.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">🔮</span>
          AI Health Predictions
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
          Beta Feature
        </span>
      </div>

      {/* Predictions (Warnings) */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          {predictions.map((pred, i) => (
            <div
              key={i}
              className={`rounded-2xl shadow-lg overflow-hidden ${
                pred.type === "danger" ? "bg-red-50 border-2 border-red-300" : "bg-yellow-50 border-2 border-yellow-300"
              }`}
            >
              <div className={`${pred.type === "danger" ? "bg-red-600" : "bg-yellow-600"} text-white p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{pred.icon}</span>
                  <div>
                    <h4 className="font-bold text-lg">{pred.title}</h4>
                    <p className="text-sm opacity-90">{pred.description}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{pred.confidence}%</div>
                  <div className="text-xs opacity-75">Confidence</div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className={`${pred.type === "danger" ? "bg-red-100 border-red-400" : "bg-yellow-100 border-yellow-400"} border-l-4 p-3 rounded`}>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>🔍</span> Prediction:
                  </p>
                  <p className="text-gray-700 mt-1">{pred.prediction}</p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span>💡</span> Recommended Actions:
                  </p>
                  <ul className="space-y-2">
                    {pred.actions.map((action, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-bold min-w-[20px]">{j + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Positive Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-gray-700 flex items-center gap-2 mt-6">
            <span className="text-2xl">✨</span>
            Positive Insights
          </h4>
          {insights.map((insight, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{insight.icon}</span>
                <div className="flex-1">
                  <h5 className="font-bold text-green-900">{insight.title}</h5>
                  <p className="text-green-800 text-sm mt-1">{insight.description}</p>
                  <p className="text-green-700 text-sm mt-2 italic">💡 {insight.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <p className="text-sm text-gray-600">
          <strong>ℹ️ How it works:</strong> Our AI analyzes trends in your vitals over the past 7 days to predict potential health issues before they become serious. Predictions become more accurate with consistent daily logging.
        </p>
      </div>
    </div>
  );
};

export default AIHealthPredictor;