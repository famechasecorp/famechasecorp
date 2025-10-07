import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Quiz from "@/pages/Quiz";

/**
 * Placeholder integration test for Quiz steps 1 and 2.
 *
 * Notes:
 * - This test is intentionally skipped until test environment mocks are configured.
 * - TODO: Replace skipped test with fully mocked integration test once test setup is verified.
 */

describe("Quiz steps (placeholder)", () => {
  test.skip("selecting platform and follower count should update state and enable Next", async () => {
    render(
      <MemoryRouter>
        <Quiz />
      </MemoryRouter>,
    );

    // Find a platform button (e.g. Instagram)
    const instagramButton = await screen.findByRole("button", { name: /instagram/i });
    fireEvent.click(instagramButton);
    expect(instagramButton).toHaveAttribute("aria-pressed", "true");

    // Find follower option radio (e.g. 1k — 10k)
    const followerOption = await screen.findByLabelText(/1k\s*—\s*10k/i);
    fireEvent.click(followerOption);
    expect((followerOption as HTMLInputElement).checked).toBe(true);

    // Next button should be enabled for the step
    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeEnabled();
  });
});