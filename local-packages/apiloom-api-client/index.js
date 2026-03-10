// Mock API client for standalone builds
export class ApiLoomConfiguration {
  constructor(config) {}
}

export class ApiLoomApiModule {
  static forRoot(config) {
    return { providers: [] };
  }
}

export class RawJsonService {
  saveRawJson() {}
  deleteRawJson() {}
  updateRawJson() {}
  getAllRawJsonsByUserID() {}
}
