// src/smartsocial/utils/mockFirebase.ts - CREATE THIS

console.log('⚠️ USING MOCK FIREBASE FOR TESTING');

// Mock Firestore that always returns success
export const db = {
  collection: (path: string) => ({
    where: (field: string, op: string, value: any) => ({
      limit: (num: number) => ({
        get: async () => ({
          empty: false,
          docs: [{
            id: 'mock_doc',
            data: () => ({
              key: 'mock_extension_key',
              userId: 'vnX7FbEvMHN7IfcBHYm0NYFVhbG2',
              isActive: true,
              createdAt: new Date()
            })
          }]
        })
      })
    })
  })
} as any;

export const app = {} as any;