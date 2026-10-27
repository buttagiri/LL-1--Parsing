import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('LL(1) Parser Visualizer UI Integration', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders application header, title, and initial FIRST sets', async () => {
    render(<App />);

    expect(screen.getByText(/LL\(1\) Parser Visualizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Context-Free Grammar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FIRST Sets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FOLLOW Sets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LL\(1\) Table/i })).toBeInTheDocument();

    // Verify initial calculation of FIRST sets
    expect(screen.getByText(/Operation 1: FIRST Set Calculation/i)).toBeInTheDocument();
  });

  it('switches to FOLLOW sets operation independently when clicking FOLLOW button', async () => {
    render(<App />);

    const followBtn = screen.getByRole('button', { name: /FOLLOW Sets/i });
    fireEvent.click(followBtn);

    expect(screen.getByText(/Operation 2: FOLLOW Set Calculation/i)).toBeInTheDocument();
    expect(screen.getByText(/Definition of FOLLOW\(A\)/i)).toBeInTheDocument();
  });

  it('switches to Table operation and displays LL(1) Table', async () => {
    render(<App />);

    const tableBtn = screen.getByRole('button', { name: /LL\(1\) Table/i });
    fireEvent.click(tableBtn);

    expect(screen.getByText(/Operation 3: LL\(1\) Predictive Parsing Table/i)).toBeInTheDocument();
    expect(screen.getByText(/LL\(1\) Grammar/i)).toBeInTheDocument();
  });

  it('detects syntax error when user enters invalid grammar', async () => {
    render(<App />);

    const textarea = screen.getByPlaceholderText(/E -> T E'/i);
    fireEvent.change(textarea, { target: { value: 'Invalid Line Without Arrow' } });

    const validateBtn = screen.getByRole('button', { name: /Validate/i });
    fireEvent.click(validateBtn);

    // Switch to FIRST to trigger error view
    const firstBtn = screen.getByRole('button', { name: /FIRST Sets/i });
    fireEvent.click(firstBtn);

    expect(screen.getByText(/Missing production arrow/i)).toBeInTheDocument();
  });

  it('marks results as edited when grammar is modified', async () => {
    render(<App />);

    const textarea = screen.getByPlaceholderText(/E -> T E'/i);
    fireEvent.change(textarea, { target: { value: 'S -> a' } });

    expect(screen.getByText(/Edited \(Recalculate\)/i)).toBeInTheDocument();
  });

  it('opens and closes theory guide modal', () => {
    render(<App />);

    const guideBtn = screen.getByRole('button', { name: /Syntax & Theory Guide/i });
    fireEvent.click(guideBtn);

    expect(screen.getByText(/LL\(1\) Compiler Theory & Quick Guide/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Guide/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/LL\(1\) Compiler Theory & Quick Guide/i)).not.toBeInTheDocument();
  });
});
