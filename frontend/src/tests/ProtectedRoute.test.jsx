import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

vi.mock("../hooks/AuthContext", () => ({
  useAuth: () => ({
    user: { role: "ADMIN" },
    loading: false,
  }),
}));

describe("ProtectedRoute", () => {
  it("renders protected content when authenticated", () => {
    render(
      <MemoryRouter initialEntries={["/secure"]}>
        <Routes>
          <Route
            path="/secure"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div>Secure Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Secure Area")).toBeInTheDocument();
  });
});
