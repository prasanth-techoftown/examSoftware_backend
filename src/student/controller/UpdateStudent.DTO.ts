export class UpdateStudentDTO {
    private readonly id: number
    private readonly admissionNumber: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly phoneNumber: string
    private readonly whatsappNumber: string
    private readonly gender: string
    private readonly address: string
  
    private readonly city: string
    private readonly state: string
    private readonly pincode: number
    private readonly parentOrGuardianName: string
    private readonly parentOrGuardianNumber: string
    private readonly counselledBy: string
    private readonly courseId: number
    private readonly courseName: string

    private readonly dateOfBirth: string
    private readonly qualification: string
    private readonly totalFees: number
    private readonly notes: string
    private readonly academicYear: number
    private readonly dateOfAdmission: string
    private readonly branchId: string
    private readonly email: string
    private readonly updatedBy: string
    private readonly photoName: string | null

    constructor(
        id: number,
        admissionNumber: string,
        firstName: string,
        lastName: string,
        phoneNumber: string,
        whatsappNumber: string,
        gender: string,
        address: string,
       
        city: string,
        state: string,
        pincode: number,
        parentOrGuardianName: string,
        parentOrGuardianNumber: string,
        counselledBy: string,
        courseId: number,
        courseName: string,
        dateOfBirth: string,
        qualification: string,
        totalFees: number,
        notes: string,
        academicYear: number,
        dateOfAdmission: string,
        branchId: string,
        email: string,
        updatedBy: string,
        photoName: string | null
    ) {
        this.id = id
        this.admissionNumber = admissionNumber
        this.firstName = firstName
        this.lastName = lastName
        this.phoneNumber = phoneNumber
        this.whatsappNumber = whatsappNumber
        this.gender = gender
        this.address = address
     
        this.city = city
        this.state = state
        this.pincode = pincode
        this.parentOrGuardianName = parentOrGuardianName
        this.parentOrGuardianNumber = parentOrGuardianNumber
        this.counselledBy = counselledBy
        this.courseId = courseId
        this.courseName = courseName
        this.dateOfBirth = dateOfBirth
        this.qualification = qualification
        this.totalFees = totalFees
        this.notes = notes
        this.academicYear = academicYear
        this.dateOfAdmission = dateOfAdmission
        this.branchId = branchId
        this.email = email
        this.updatedBy = updatedBy
        this.photoName = photoName
    }
    getId() {
        return this.id
    }
    getAdmissionNumber() {
        return this.admissionNumber
    }
    getFirstName() {
        return this.firstName
    }
    getLastName() {
        return this.lastName
    }
    getPhoneNumber() {
        return this.phoneNumber
    }
    getWhatsappNumber() {
        return this.whatsappNumber
    }

    getGender() {
        return this.gender
    }
    getPhotoName() {
        return this.photoName
    }
    getAddress() {
        return this.address
    }
   
    getCity() {
        return this.city
    }
    getState() {
        return this.state
    }
    getPincode() {
        return this.pincode
    }
    getParentOrGuardianName() {
        return this.parentOrGuardianName
    }
    getParentOrGuardianNumber() {
        return this.parentOrGuardianNumber
    }
    getCounselledBy() {
        return this.counselledBy
    }
    getCourseId() {
        return this.courseId
    }
    getCourseName() {
        return this.courseName
    }
    getDateOfBirth() {
        return this.dateOfBirth
    }
    getQualification() {
        return this.qualification
    }
    getTotalFees() {
        return this.totalFees
    }
    getNotes() {
        return this.notes
    }
    getAcademicYear() {
        return this.academicYear
    }
    getDateOfAdmission() {
        return this.dateOfAdmission
    }
    getBranchId() {
        return this.branchId
    }
    getEmail() {
        return this.email
    }
    getUpdatedBy() {
        return this.updatedBy
    }
}
