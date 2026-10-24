export class UpdateUserDTO {
    private readonly id: string
    private readonly firstName: string
    private readonly lastName: string
    private readonly userName: string
    private readonly email: string
    private readonly roleId: number
    private readonly phoneNumber: string
    private readonly updatedBy: string
    private isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    private isValidPhone(phone: string): boolean {
        return /^[6-9]\d{9}$/.test(phone)
    }
    constructor(
        id: string,
        firstName: string,
        lastName: string,
        userName: string,
        email: string,
        roleId: number,
        phoneNumber: string,
        updatedBy: string
    ) {
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format')
        }

        if (!this.isValidPhone(phoneNumber)) {
            throw new Error('Invalid phone number')
        }
        this.id = id
        this.firstName = firstName.trim()
        this.lastName = lastName.trim()
        this.userName = userName.trim()
        this.email = email.trim()
        this.roleId = roleId
        this.phoneNumber = phoneNumber.trim()
        this.updatedBy = updatedBy.trim()
    }

    getId(): string {
        return this.id
    }

    getFirstName(): string {
        return this.firstName
    }

    getLastName(): string {
        return this.lastName
    }

    getUserName(): string {
        return this.userName
    }

    getEmail(): string {
        return this.email
    }

    getRoleId(): number {
        return this.roleId
    }

    getPhoneNumber(): string {
        return this.phoneNumber
    }

    getUpdatedBy(): string {
        return this.updatedBy
    }
}
