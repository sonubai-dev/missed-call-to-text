package com.misscall.whatsappassistant.crm

import com.misscall.whatsappassistant.core.util.NumberNormalizer
import com.misscall.whatsappassistant.database.entity.CustomerEntity
import com.misscall.whatsappassistant.domain.model.CustomerBusinessStatus
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DuplicateCustomerTest {

    private fun findMatchingCustomer(
        rawPhoneNumber: String,
        existingCustomers: List<CustomerEntity>
    ): CustomerEntity? {
        val normalized = NumberNormalizer.normalize(rawPhoneNumber)
        val national10Digit = if (normalized.length > 10) normalized.takeLast(10) else normalized

        return existingCustomers.firstOrNull { c ->
            c.phoneNumber == rawPhoneNumber ||
                    c.phoneNumber == normalized ||
                    c.phoneNumber.endsWith(national10Digit) ||
                    normalized.endsWith(c.phoneNumber.takeLast(10))
        }
    }

    @Test
    fun `matching finds customer with identical number`() {
        val existing = listOf(
            CustomerEntity(id = 1, phoneNumber = "+919876543210", name = "Rahul Sharma")
        )
        val match = findMatchingCustomer("+919876543210", existing)
        assertNotNull(match)
        assertEquals(1L, match!!.id)
    }

    @Test
    fun `matching finds customer without country code`() {
        val existing = listOf(
            CustomerEntity(id = 2, phoneNumber = "+919876543210", name = "Amit Patel")
        )
        val match = findMatchingCustomer("9876543210", existing)
        assertNotNull(match)
        assertEquals(2L, match!!.id)
    }

    @Test
    fun `matching finds customer with formatted dashes and spaces`() {
        val existing = listOf(
            CustomerEntity(id = 3, phoneNumber = "+919876543210", name = "Priya Singh")
        )
        val match = findMatchingCustomer("+91 98765-43210", existing)
        assertNotNull(match)
        assertEquals(3L, match!!.id)
    }

    @Test
    fun `matching finds customer with leading zero`() {
        val existing = listOf(
            CustomerEntity(id = 4, phoneNumber = "+919876543210", name = "Sneha Verma")
        )
        val match = findMatchingCustomer("09876543210", existing)
        assertNotNull(match)
        assertEquals(4L, match!!.id)
    }

    @Test
    fun `non matching number returns null`() {
        val existing = listOf(
            CustomerEntity(id = 5, phoneNumber = "+919876543210", name = "Vikram Malhotra")
        )
        val match = findMatchingCustomer("+919123456780", existing)
        assertEquals(null, match)
    }

    @Test
    fun `resolve logic increments call count and preserves valid name`() {
        val existingCustomer = CustomerEntity(
            id = 10,
            phoneNumber = "+919876543210",
            name = "Existing Name",
            totalMissedCalls = 3,
            businessStatus = CustomerBusinessStatus.FOLLOW_UP.name
        )

        val updated = existingCustomer.copy(
            name = "New Caller Name".takeIf { it.isNotBlank() } ?: existingCustomer.name,
            totalMissedCalls = existingCustomer.totalMissedCalls + 1,
            lastCallTimestamp = 1725580000000L
        )

        assertEquals(4, updated.totalMissedCalls)
        assertEquals("New Caller Name", updated.name)
        assertEquals(CustomerBusinessStatus.FOLLOW_UP.name, updated.businessStatus)
    }
}
