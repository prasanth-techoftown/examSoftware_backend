export class UserDTO {
    private readonly firstName: string
    private readonly lastName?: string | null
    private readonly userName: string
    private readonly email: string
    private readonly roleId: number
    private readonly phoneNumber: string
    private readonly createdBy: string

    private isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    private isValidPhone(phone: string): boolean {
        return /^[6-9]\d{9}$/.test(phone)
    }

    constructor(
        firstName: string,
        lastName: string | null,
        userName: string,
        email: string,
        roleId: number,
        phoneNumber: string,
        createdBy: string
    ) {
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format')
        }

        if (!this.isValidPhone(phoneNumber)) {
            throw new Error('Invalid phone number')
        }

        this.firstName = firstName.trim()
        this.lastName = lastName?.trim() ?? null
        this.userName = userName.trim()
        this.email = email.trim()
        this.roleId = roleId
        this.phoneNumber = phoneNumber.trim()
        this.createdBy = createdBy.trim()
    }

    getFirstName(): string {
        return this.firstName
    }

    getLastName(): string | null | undefined {
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

    getCreatedBy(): string {
        return this.createdBy
    }
}
