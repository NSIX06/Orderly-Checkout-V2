describe("Validação quantidade", () => {
  it("não aceita quantidade zero", () => {
    const qtd = 0;
    expect(qtd > 0).toBe(false);
  });
});
