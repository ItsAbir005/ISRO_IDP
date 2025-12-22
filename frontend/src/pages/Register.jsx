import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registered successfully! Please login.");
        navigate("/login");
      } else alert(data.message);
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Register</h2>
        {["name", "email", "password"].map((f) => (
          <input
            key={f}
            type={f === "password" ? "password" : "text"}
            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
            className="w-full p-2 mb-3 border rounded"
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
          />
        ))}
        <button className="w-full bg-green-600 text-white py-2 rounded">Register</button>
        <p className="text-sm text-center mt-3">
          Already have an account? <span onClick={() => navigate("/login")} className="text-blue-500 cursor-pointer">Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
