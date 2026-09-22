const parser = {
  parseXmlString(input: string, callback: (result: unknown) => void) {
    callback({ raw: input });
  },
};

export function importPartnerXml(req: any): void {
  parser.parseXmlString(req.body.xml, () => undefined);
}
