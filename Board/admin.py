from django.contrib import admin
from .models import List, Ticket, TicketToUser

# Register your models here.
class TicketToUserInline(admin.TabularInline):
    model = Ticket.ticket_to_user.through #To see the ManyToMany-Field in the Admin-Interface


class TicketAdmin(admin.ModelAdmin):
   fields = ('ticket_description','ticket_title','ticket_duedate','ticket_prio','ticket_created_at','ticket_list') #Shown fields
   inlines = [TicketToUserInline] #To see the ManyToMany-Field in the Admin-Interface


admin.site.register(List)
admin.site.register(Ticket, TicketAdmin) #A view 'TicketAdmin' for the model Ticket is created in the Admin-Panel
admin.site.register(TicketToUser) 