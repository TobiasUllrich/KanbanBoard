from django.db import models
from django.conf import settings
from datetime import date
from django.contrib.auth.models import User

# Create your models here.

# [1.] Model User already exists (id, username,first_name,last_name,email,password)

# [2.] Lists (id, list_name)
class List(models.Model):
    list_name = models.CharField(max_length=500)

# [3.] Tickets (id, ticket_description,ticket_title,ticket_duedate,ticket_prio,ticket_created_at,ticket_list,ticket_to_user)
class Ticket(models.Model):
    ticket_description = models.CharField(max_length=500)
    ticket_title = models.CharField(max_length=500)
    ticket_duedate = models.DateField(default=date.today)      
    ticket_prio = models.CharField(max_length=500)
    ticket_created_at = models.DateField(default=date.today)  
    ticket_list = models.ForeignKey(to=List, on_delete=models.CASCADE, related_name='ticket_in_list',null=True)  #ForeignKey can be accessed through 'Tickets.ticket_in_list'
    ticket_to_user = models.ManyToManyField(to=User, through='TicketToUser' , related_name='ticket_to_user')

# [4.] Intermediate Model between Ticket and User
class TicketToUser(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    t2u_created_at = models.DateField(default=date.today)