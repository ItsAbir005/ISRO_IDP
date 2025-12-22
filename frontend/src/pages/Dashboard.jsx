import React, { useEffect, useState, useRef } from "react";
import VitalCard from "../components/VitalCard";
import EmergencyAlert from "../components/EmergencyAlert";
import AIHealthPredictor from "../components/AIHealthPredictor";
import { useLocalStorage, getUserData } from "../hooks/useLocalStorage";
import { checkAbnormalVitals } from "../utils/vitalRules";
import { showMotivationalToast } from "../utils/motivationUtils";
import toast, { Toaster } from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_URL } from "../config/api";

const Dashboard = () => {
  const [vitals] = useLocalStorage("vitals", []);
  const [data, setData] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);
  const hasShownNotifications = useRef(false);
  
  const userEmail = localStorage.getItem("userEmail");
  const streak = getUserData("streak") || 0;
  const points = getUserData("points") || 0;

  const latest = vitals.length ? vitals[vitals.length - 1] : null;

  // ✅ Check for emergency conditions
  useEffect(() => {
    if (latest) {
      const isEmergency = 
        latest.heartRate > 150 || 
        latest.heartRate < 40 || 
        latest.spo2 < 90 || 
        latest.temp > 103;
      
      const [systolic, diastolic] = latest.bp.split("/").map(Number);
      const bpEmergency = systolic > 180 || diastolic > 120;
      
      if (isEmergency || bpEmergency) {
        setShowEmergency(true);
      }
    }
  }, [latest?.timestamp]);

  // ✅ Show notifications only once
  useEffect(() => {
    if (latest && !hasShownNotifications.current) {
      hasShownNotifications.current = true;
      
      const alerts = checkAbnormalVitals(latest);
      if (alerts.length > 0) {
        alerts.forEach(msg =>
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } max-w-sm w-full bg-white border-l-4 border-red-500 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}
              >
                <div className="flex flex-col w-0 flex-1">
                  <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Health Alert</p>
                  <p className="text-gray-700 text-sm">{msg}</p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600 transition"
                >
                  ✖
                </button>
              </div>
            ),
            { duration: 5000, id: `alert-${msg}` }
          )
        );
      }
      
      showMotivationalToast(Number(streak), Number(points));
    }
  }, [latest?.timestamp]);

  // 📈 Prepare chart data
  useEffect(() => {
    setData(
      vitals.map((v, index) => ({
        name: `#${index + 1}`,
        heartRate: Number(v.heartRate),
        spo2: Number(v.spo2),
        temp: Number(v.temp),
      }))
    );
  }, [vitals]);

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Please login to view your dashboard.</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No vitals logged yet.</p>
          <p className="text-gray-500">Go to "Log Vitals" to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* Emergency Alert Modal */}
      {showEmergency && (
        <EmergencyAlert 
          vitals={latest} 
          onClose={() => setShowEmergency(false)} 
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-700 text-center">
          🏥 Health Dashboard
        </h1>

        {/* Quick Action Buttons */}
        <div className="flex gap-3 justify-center mb-6 flex-wrap">
          <button
            onClick={() => setShowPredictor(!showPredictor)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <span className="text-xl">🔮</span>
            {showPredictor ? "Hide" : "Show"} AI Predictions
          </button>
          
          <button
            onClick={() => window.location.href = "/family"}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            Family Hub
          </button>
        </div>

        {/* AI Health Predictor */}
        {showPredictor && (
          <div className="mb-8">
            <AIHealthPredictor />
          </div>
        )}

        {/* Vital Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <VitalCard 
            title="Heart Rate" 
            value={latest.heartRate} 
            unit="bpm" 
            statusColor="border-green-500" 
          />
          <VitalCard 
            title="SpO₂" 
            value={latest.spo2} 
            unit="%" 
            statusColor="border-green-500" 
          />
          <VitalCard 
            title="Blood Pressure" 
            value={latest.bp} 
            unit="mmHg" 
            statusColor="border-green-500" 
          />
          <VitalCard 
            title="Temperature" 
            value={latest.temp} 
            unit="°F" 
            statusColor="border-green-500" 
          />
          <VitalCard 
            title="Steps" 
            value={latest.steps} 
            unit="steps" 
            statusColor="border-yellow-500" 
          />
        </div>

        {/* Streak and Points */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-6">
          <div className="bg-white shadow-lg p-6 rounded-xl text-center flex-1 max-w-xs">
            <h3 className="text-gray-600 mb-2">🔥 Streak</h3>
            <p className="text-3xl font-bold text-blue-600">{streak} days</p>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-xl text-center flex-1 max-w-xs">
            <h3 className="text-gray-600 mb-2">⭐ Points</h3>
            <p className="text-3xl font-bold text-green-600">{points}</p>
          </div>
        </div>

        {/* Motivation Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 shadow-lg p-6 rounded-2xl text-center border border-green-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">💬 Daily Motivation</h3>
            <p className="text-gray-600">
              {streak >= 5
                ? "🔥 Great job keeping your streak alive! Keep tracking your vitals every day!"
                : "🌱 Small steps make strong habits — log your vitals today to keep growing!"}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            📈 Heart Rate & SpO₂ Trend
          </h2>
          {data.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Not enough data for trend chart yet. Keep logging!
            </p>
          )}
        </div>

        <p className="mt-6 text-gray-500 text-sm text-center">
          Last updated: {latest.timestamp}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;