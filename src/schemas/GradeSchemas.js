export default class GradeSchema {
  static schema = {
    name: 'Grade',
    primaryKey: 'id',
    properties: {
      id: {
        type: 'int',
        indexed: true,
      },
      id_disciplina: 'int',
      name: 'string',
      grade: 'int',
      maximum_grade: 'int',
      date: 'date',
    },
  };
}
