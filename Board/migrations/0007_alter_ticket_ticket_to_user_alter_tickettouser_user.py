# Generated by Django 4.1.6 on 2023-02-10 17:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('Board', '0006_userprofile_alter_ticket_ticket_to_user_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='ticket_to_user',
            field=models.ManyToManyField(through='Board.TicketToUser', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='tickettouser',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
