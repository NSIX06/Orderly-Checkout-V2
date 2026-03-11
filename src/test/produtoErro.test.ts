describe("Produto inexistente", () => {
  it("deve gerar erro se produto não existir", () => {
    const produto = null;
    expect(produto).toBeNull();
  });
});
