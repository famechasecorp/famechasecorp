import React from "react";
import { render } from "@testing-library/react";
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
  });
});
