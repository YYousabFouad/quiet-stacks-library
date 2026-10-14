export function createMemberRecord(data, id) {
  return {
    id: id || data.id,
    name: data.name.trim(),
    email: data.email.trim(),
    membershipType: data.membershipType || 'standard',
    status: data.status || 'active',
    borrowedCount: data.borrowedCount || 0
  };
}
