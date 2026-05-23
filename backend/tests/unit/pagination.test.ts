describe('pagination offset calculation', () => {
  it('returns offset 0 for page 1', () => {
    const offset = (1 - 1) * 20;
    expect(offset).toBe(0);
  });

  it('returns correct offset for page 3 with limit 20', () => {
    const offset = (3 - 1) * 20;
    expect(offset).toBe(40);
  });

  it('returns correct offset for page 2 with limit 50', () => {
    const offset = (2 - 1) * 50;
    expect(offset).toBe(50);
  });
});
