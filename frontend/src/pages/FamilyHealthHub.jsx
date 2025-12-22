// frontend/src/pages/FamilyHealthHub.jsx
import React, { useState, useEffect } from "react";
import { getUserData, setUserData } from "../hooks/useLocalStorage";
import { API_URL } from "../config/api";

const FamilyHealthHub = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    age: "",
    relation: "",
    emergencyContact: "",
  });

  useEffect(() => {
    const saved = getUserData("familyMembers") || [];
    setFamilyMembers(saved);
  }, []);

  const addMember = (e) => {
    e.preventDefault();
    const member = {
      id: Date.now(),
      ...newMember,
      vitals: [],
      alerts: [],
      lastChecked: new Date().toLocaleDateString(),
    };
    
    const updated = [...familyMembers, member];
    setFamilyMembers(updated);
    setUserData("familyMembers", updated);
    
    setNewMember({ name: "", age: "", relation: "", emergencyContact: "" });
    setShowAddForm(false);
  };

  const removeMember = (id) => {
    if (!confirm("Are you sure you want to remove this family member?")) return;
    const updated = familyMembers.filter(m => m.id !== id);
    setFamilyMembers(updated);
    setUserData("familyMembers", updated);
  };

  const getHealthStatus = (member) => {
    if (!member.vitals || member.vitals.length === 0) {
      return { status: "unknown", color: "gray", message: "No data logged" };
    }

    const latest = member.vitals[member.vitals.length - 1];
    
    // Check for critical issues
    if (latest.heartRate > 150 || latest.heartRate < 40 || latest.spo2 < 90) {
      return { status: "critical", color: "red", message: "Needs immediate attention!" };
    }
    
    if (latest.heartRate > 120 || latest.heartRate < 50 || latest.spo2 < 95 || latest.temp > 100.4) {
      return { status: "warning", color: "yellow", message: "Concerning vitals" };
    }
    
    return { status: "good", color: "green", message: "All vitals normal" };
  };

  const relations = ["Parent", "Spouse", "Child", "Sibling", "Grandparent", "Other"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">👨‍👩‍👧‍👦</span>
              Family Health Hub
            </h1>
            <p className="text-gray-600 mt-2">Monitor your entire family's health in one place</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Add Family Member
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Family Member</h2>
              
              <form onSubmit={addMember} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Mom"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., 65"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Relation *</label>
                  <select
                    value={newMember.relation}
                    onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Select relation</option>
                    {relations.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={newMember.emergencyContact}
                    onChange={(e) => setNewMember({...newMember, emergencyContact: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., +1 555-0123"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Family Overview Grid */}
        {familyMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">👨‍👩‍👧‍👦</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Add Your First Family Member</h3>
            <p className="text-gray-600 mb-6">
              Monitor health for your entire family - parents, kids, spouse, anyone you care about
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => {
              const health = getHealthStatus(member);
              
              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                    health.color === "red" ? "border-red-400" :
                    health.color === "yellow" ? "border-yellow-400" :
                    health.color === "green" ? "border-green-400" : "border-gray-300"
                  } hover:shadow-xl transition cursor-pointer`}
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Header */}
                  <div className={`p-4 ${
                    health.color === "red" ? "bg-red-500" :
                    health.color === "yellow" ? "bg-yellow-500" :
                    health.color === "green" ? "bg-green-500" : "bg-gray-400"
                  } text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-sm opacity-90">{member.relation} • Age {member.age}</p>
                      </div>
                      <span className="text-4xl">
                        {member.relation === "Parent" ? "👴" :
                         member.relation === "Spouse" ? "👫" :
                         member.relation === "Child" ? "👶" :
                         member.relation === "Sibling" ? "👫" :
                         member.relation === "Grandparent" ? "👵" : "👤"}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${
                        health.color === "red" ? "bg-red-500 animate-pulse" :
                        health.color === "yellow" ? "bg-yellow-500" :
                        health.color === "green" ? "bg-green-500" : "bg-gray-400"
                      }`}></span>
                      <span className="text-sm font-semibold text-gray-800">
                        {health.message}
                      </span>
                    </div>

                    {member.vitals && member.vitals.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">Heart Rate:</span>
                          <span className="font-bold ml-1">
                            {member.vitals[member.vitals.length - 1].heartRate} bpm
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-gray-600">SpO₂:</span>
                          <span className="font-bold ml-1">
                            {member.vitals[member.vitals.length - 1].spo2}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded text-center text-sm text-gray-600">
                        No vitals logged yet
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Add vitals feature - would open vitals logging form");
                        }}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition text-sm"
                      >
                        📝 Log Vitals
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMember(member.id);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-2 rounded-lg transition text-sm"
                      >
                        🗑️
                      </button>
                    </div>

                    {member.emergencyContact && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        📞 {member.emergencyContact}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <span className="text-4xl mb-3 block">🔔</span>
            <h4 className="font-bold text-gray-800 mb-2">Smart Alerts</h4>
            <p className="text-sm text-gray-600">
              Get notified when family members have concerning vitals
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <h4 className="font-bold text-gray-800 mb-2">Trend Tracking</h4>
            <p className="text-sm text-gray-600">
              Monitor long-term health patterns for everyone
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <span className="text-4xl mb-3 block">💊</span>
            <h4 className="font-bold text-gray-800 mb-2">Medication Reminders</h4>
            <p className="text-sm text-gray-600">
              Never miss a dose with smart medication tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyHealthHub;