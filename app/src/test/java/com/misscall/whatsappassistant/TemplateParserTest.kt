package com.misscall.whatsappassistant

import com.misscall.whatsappassistant.core.util.TemplateParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class TemplateParserTest {

    @Test
    fun `parses Template 1 with caller name and business name`() {
        val template = "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?"
        val result = TemplateParser.parse(
            template = template,
            callerName = "Rahul Sharma",
            phoneNumber = "+919876543210",
            businessName = "Apex Electronics",
            ownerName = "John"
        )
        assertEquals(
            "Hi Rahul Sharma, we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
            result
        )
    }

    @Test
    fun `parses Template 1 when caller name is missing with clean fallback`() {
        val template = "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?"
        val result = TemplateParser.parse(
            template = template,
            callerName = null,
            phoneNumber = "+919876543210",
            businessName = "Apex Electronics",
            ownerName = "John"
        )
        assertEquals(
            "Hi! we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
            result
        )
    }

    @Test
    fun `parses Template 2`() {
        val template = "Hi! Sorry we missed your call. Please reply here with what you need and our team will get back to you shortly."
        val result = TemplateParser.parse(
            template = template,
            callerName = "John Doe",
            phoneNumber = "+919876543210",
            businessName = "Apex Electronics",
            ownerName = "Owner"
        )
        assertEquals(
            "Hi! Sorry we missed your call. Please reply here with what you need and our team will get back to you shortly.",
            result
        )
    }

    @Test
    fun `parses Template 3 with phone, date, and time variables`() {
        val template = "Hello {{name}}, thanks for contacting {{business_name}}. We missed your call from {{phone}} on {{date}} at {{time}}."
        val result = TemplateParser.parse(
            template = template,
            callerName = "Priya",
            phoneNumber = "+919876543210",
            businessName = "Apex Store",
            ownerName = "Owner",
            timestamp = 1700000000000L
        )
        assertTrue(result.contains("Hello Priya"))
        assertTrue(result.contains("Apex Store"))
        assertTrue(result.contains("+919876543210"))
    }
}
