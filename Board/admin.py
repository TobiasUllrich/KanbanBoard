from django.contrib import admin
from .models import List, Ticket, TicketToUser

# Register your models here.

class TicketToUserInline(admin.TabularInline):
    model = Ticket.ticket_to_user.through #Um das ManyToMany-Field im Admin-Interface darzustellen
class TicketAdmin(admin.ModelAdmin):
   fields = ('ticket_description','ticket_title','ticket_duedate','ticket_prio','ticket_created_at','ticket_list') #Diese Felder werden angezeigt
   inlines = [TicketToUserInline] #Um das ManyToMany-Field im Admin-Interface darzustellen



admin.site.register(List)
admin.site.register(Ticket, TicketAdmin) #Es wird eine Ansicht 'TicketAdmin' für das Ticket-Model erschaffen
admin.site.register(TicketToUser)