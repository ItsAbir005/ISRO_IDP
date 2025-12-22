// frontend/src/components/EmergencyAlert.jsx
import React, { useState } from "react";
import { API_URL } from "../config/api";

const EmergencyAlert = ({ vitals, onClose }) => {
  const [calling, setCalling] = useState(false);
  const [notified, setNotified] = useState(false);

  const emergencyContacts = [
    { name: "Emergency Services", phone: "911" },
    { name: "Family Contact 1", phone: localStorage.getItem("emergency1") || "Not Set" },
    { name: "Family Contact 2", phone: localStorage.getItem("emergency2") || "Not Set" },
  ];

  const getCriticalIssue = () => {
    if (vitals.heartRate > 150) return {
      issue: "Dangerously High Heart Rate",
      value: `${vitals.heartRate} bpm`,
      action: "Tachycardia detected",
      icon: "💓",
      color: "red"
    };
    if (vitals.heartRate < 40) return {
      issue: "Critically Low Heart Rate",
      value: `${vitals.heartRate} bpm`,
      action: "Bradycardia detected",
      icon: "💔",
      color: "red"
    };
    if (vitals.spo2 < 90) return {
      issue: "Oxygen Emergency",
      value: `${vitals.spo2}%`,
      action: "Severe hypoxemia",
      icon: "🫁",
      color: "red"
    };
    if (vitals.temp > 103) return {
      issue: "High Fever Emergency",
      value: `${vitals.temp}°F`,
      action: "Dangerously high temperature",
      icon: "🌡️",
      color: "orange"
    };
    
    const [systolic, diastolic] = vitals.bp.split("/").map(Number);
    if (systolic > 180 || diastolic > 120) return {
      issue: "Hypertensive Crisis",
      value: vitals.bp,
      action: "Extremely high blood pressure",
      icon: "🩺",
      color: "red"
    };
    
    return null;
  };

  const critical = getCriticalIssue();

  const getFirstAidSteps = () => {
    if (vitals.heartRate > 150 || vitals.heartRate < 40) return [
      "Sit down immediately and stay calm",
      "Loosen tight clothing around neck/chest",
      "Take slow, deep breaths",
      "Do NOT exercise or exert yourself",
      "Have someone stay with you"
    ];
    if (vitals.spo2 < 90) return [
      "Sit upright immediately",
      "Open windows for fresh air",
      "Remove tight clothing",
      "Use prescribed oxygen if available",
      "Do NOT lie down flat"
    ];
    if (vitals.temp > 103) return [
      "Remove excess clothing",
      "Apply cool, wet cloths to forehead/neck",
      "Drink cool water slowly",
      "Take acetaminophen if available",
      "Do NOT use ice or cold bath"
    ];
    return [
      "Stay calm and sit down",
      "Call emergency services",
      "Note time symptoms started",
      "Gather medications list",
      "Have someone stay with you"
    ];
  };

  const handleEmergencyCall = () => {
    setCalling(true);
    // In production, this would integrate with phone dialer
    window.location.href = "tel:911";
    setTimeout(() => setCalling(false), 3000);
  };

  const handleNotifyContacts = async () => {
    setNotified(true);
    
    // In production, this would send SMS via Twilio API
    const message = `HEALTH EMERGENCY ALERT\n\n${critical.issue}: ${critical.value}\n\nVitals:\nHeart Rate: ${vitals.heartRate} bpm\nSpO₂: ${vitals.spo2}%\nBP: ${vitals.bp}\nTemp: ${vitals.temp}°F\n\nLocation: [GPS coordinates would be here]\nTime: ${new Date().toLocaleString()}\n\nPlease check on ${localStorage.getItem("userName") || "user"} immediately.`;
    
    console.log("📱 SMS sent to emergency contacts:", message);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert("Emergency contacts have been notified!");
  };

  if (!critical) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-pulse">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-once">
        {/* Header */}
        <div className={`bg-gradient-to-r ${critical.color === 'red' ? 'from-red-600 to-red-700' : 'from-orange-600 to-orange-700'} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-5xl animate-pulse">{critical.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">⚠️ EMERGENCY ALERT</h2>
                <p className="text-sm opacity-90">{critical.action}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Critical Values */}
        <div className="p-6 bg-red-50 border-l-4 border-red-600">
          <h3 className="text-xl font-bold text-red-900 mb-2">
            {critical.issue}
          </h3>
          <p className="text-3xl font-bold text-red-700">{critical.value}</p>
          <p className="text-sm text-red-600 mt-2">
            Logged: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleEmergencyCall}
              disabled={calling}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🚨</span>
              {calling ? "Calling..." : "Call 911 Now"}
            </button>

            <button
              onClick={handleNotifyContacts}
              disabled={notified}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <span className="text-2xl">📱</span>
              {notified ? "Contacts Notified ✓" : "Notify Family"}
            </button>
          </div>

          {/* First Aid Steps */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🏥</span>
              Immediate First Aid Steps:
            </h4>
            <ol className="space-y-2">
              {getFirstAidSteps().map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 min-w-[24px]">{i + 1}.</span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-3">📞 Emergency Contacts:</h4>
            <div className="space-y-2">
              {emergencyContacts.map((contact, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="font-medium">{contact.name}</span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* All Vitals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-3">📊 Current Vitals:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded">
                <span className="text-gray-600">Heart Rate:</span>
                <span className="font-bold ml-2">{vitals.heartRate} bpm</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="text-gray-600">SpO₂:</span>
                <span className="font-bold ml-2">{vitals.spo2}%</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="text-gray-600">Blood Pressure:</span>
                <span className="font-bold ml-2">{vitals.bp}</span>
              </div>
              <div className="bg-white p-3 rounded">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-bold ml-2">{vitals.temp}°F</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
            <p className="text-sm text-yellow-900">
              ⚠️ <strong>Important:</strong> This is an automated alert. If symptoms worsen or you feel unsafe, call emergency services immediately. Do not wait.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;