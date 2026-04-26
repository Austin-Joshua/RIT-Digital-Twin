import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/api.service";
import { API_CONFIG } from "../../config/api.config";

const initialForm = {
  date: "",
  startTime: "",
  endTime: "",
  purpose: "",
  courseCode: "",
};

export default function ClassroomAllocation() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(API_CONFIG.ENDPOINTS.CLASSROOMS);
        setClassrooms(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load classrooms.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const canCheck = useMemo(
    () => selectedClassroom && form.date && form.startTime && form.endTime,
    [selectedClassroom, form]
  );

  const checkAvailability = async () => {
    if (!canCheck) return;
    try {
      setError("");
      setMessage("");
      const res = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.CLASSROOMS}/${selectedClassroom.id}/availability`,
        { params: { date: form.date, startTime: form.startTime, endTime: form.endTime } }
      );
      setMessage(res.data?.available ? "Slot is available." : "Slot is already booked.");
    } catch (err) {
      setError(err?.response?.data?.message || "Availability check failed.");
    }
  };

  const bookNow = async (e) => {
    e.preventDefault();
    if (!selectedClassroom) return;
    try {
      setError("");
      setMessage("");
      await apiClient.post(API_CONFIG.ENDPOINTS.CLASSROOM_BOOKINGS, {
        classroomId: selectedClassroom.id,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        courseCode: form.courseCode,
      });
      setMessage("Booking request created.");
      setForm(initialForm);
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading classrooms...</div>;

  return (
    <div style={{ padding: 20, color: "var(--theme-text)" }}>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Classroom Allocation</h2>
      {error ? <div style={{ color: "var(--color-danger)", marginBottom: 8 }}>{error}</div> : null}
      {message ? <div style={{ color: "var(--color-success)", marginBottom: 8 }}>{message}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          {classrooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedClassroom(room)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: 10,
                marginBottom: 8,
                borderRadius: 8,
                border: selectedClassroom?.id === room.id ? "1px solid var(--theme-brand-strong)" : "1px solid var(--theme-border)",
                background: "var(--card-bg)",
                color: "var(--theme-text)",
              }}
            >
              <strong>{room.name}</strong> - {room.buildingName} (Cap: {room.capacity})
            </button>
          ))}
        </div>
        <form onSubmit={bookNow} style={{ display: "grid", gap: 8 }}>
          <input type="text" disabled value={selectedClassroom ? `${selectedClassroom.name}` : "Select classroom"} />
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          <input type="text" placeholder="Course code" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
          <textarea placeholder="Purpose" required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          <button type="button" onClick={checkAvailability} disabled={!canCheck}>Check Availability</button>
          <button type="submit" disabled={!canCheck}>Book Now</button>
        </form>
      </div>
    </div>
  );
}
