export class IdConverter {
  static toString(id: number | string): string {
    return id.toString();
  }

  static toNumber(id: string | number): number {
    return typeof id === 'string' ? parseInt(id, 10) : id;
  }
}