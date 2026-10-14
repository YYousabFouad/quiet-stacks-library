export const LOAN_DURATION_DAYS = 14;

export const BORROW_LIMITS = Object.freeze({
  standard: 3,
  student: 5,
  faculty: 10,
  premium: 5
});

export function getLoanDates(durationDays = LOAN_DURATION_DAYS, now = new Date()) {
  const dateOptions = { month: 'short', day: 'numeric' };
  const dueAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return {
    borrowedDate: now.toLocaleDateString('en-US', dateOptions),
    dueDate: dueAt.toLocaleDateString('en-US', dateOptions),
    dueDateISO: dueAt.toISOString()
  };
}

export function isLoanOverdue(loan, now = new Date()) {
  return Boolean(loan.dueDateISO && now.getTime() > Date.parse(loan.dueDateISO));
}

export function canBorrow(account, activeLoanCount) {
  const limit = BORROW_LIMITS[account?.membershipType] ?? BORROW_LIMITS.standard;
  return activeLoanCount < limit;
}
