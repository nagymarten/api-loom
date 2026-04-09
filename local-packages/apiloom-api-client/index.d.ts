export class ApiLoomConfiguration {
  constructor(config?: any);
}

export class ApiLoomApiModule {
  static forRoot(config?: any): any;
}

export class RawJsonService {
  saveRawJson(data: any): any;
  deleteRawJson(id: string): any;
  updateRawJson(id: string, data: any): any;
  getAllRawJsonsByUserID(): any;
}
