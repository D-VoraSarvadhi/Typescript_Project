import { DataTypes, Model } from 'sequelize';
import db from '../config/db';
import User from './userModel';
import Class from './classModel';
import { appError } from '../utils/errorHelper';
import { notFoundmessage } from '../middleware/responseHandle';
import errorType from '../utils/errorType';
import Lecture from './lectureModel';
import Attendance from './attendanceModel';
import { ROLES } from '../constant/role';

interface studentAttribute extends Model {
  teacher_id: number;
  student_id: number;
  class_id: number;
}

const Student = db.define<studentAttribute>('Students',{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    validate: {
      notEmpty: true
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: {
      name: '',
      msg: 'Student already assign !!'
    },
    references: {
      model: User,
      key: 'id'
    },
    validate: {
      notEmpty: true
    }
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Class,
      key: 'id'
    },
    validate: {
      notEmpty: true
    }
  }
}, {
  timestamps: false
});

Class.hasMany(Student, { foreignKey: 'class_id', sourceKey: 'id' });
User.hasMany(Student, { foreignKey: 'teacher_id' });
User.hasOne(Student, { foreignKey: 'student_id' });
Student.hasMany(Lecture, { foreignKey: 'class_id', sourceKey: 'class_id' });
Student.hasMany(Attendance, { foreignKey: 'studentID', sourceKey: 'student_id' });

Student.belongsTo(User, { foreignKey: 'teacher_id' });
Student.belongsTo(User, { foreignKey: 'student_id' });
Student.belongsTo(Class, { foreignKey: 'class_id' });

Student.beforeValidate(async values => {
  const classdata = await Class.findByPk(values.class_id);
  if(!classdata) throw new appError(errorType.bad_request, notFoundmessage('Class'));

  const data = await User.findByPk(values.student_id);
  if(data?.roles === ROLES.STUDENT) return;
  throw new appError(errorType.bad_request, notFoundmessage('Student'));
});

export default Student;