from django.views.generic.base import TemplateView
from .settings import REZFLOW_API_KEY
import requests
from django.http import JsonResponse
import json
from django.views.decorators.vary import vary_on_headers


class Home(TemplateView):
    """
    View to display the Homepage including Hero image, about us
    """
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['companies'] = [

            {
                'name': 'Napa Valley Balloons',
                'uuid': '54ecdc7759f44829081dc807'
            },
            {
                'name': 'Lake Tahoe Balloons',
                'uuid': '55072a1085b826730790f458'
            },
            {
                'name': 'Yolo Balloon Adventures',
                'uuid': '55b1282464b67695ffecd074'
            },
            {
                'name': 'Balloon Nevada',
                'uuid': '5bcf32c09c3a3fdda3a8cfc7'
            },
            {
                'name': 'Calistoga Ballooning Adventures',
                'uuid': '557f229c48fd6db7124b9d6b'
            },
            {
                'name': 'Up & Away Ballooning',
                'uuid': '56882deca7ad746ea43db708'
            },
            {
                'name': 'Sonoma Ballooning Adventures',
                'uuid': '5ae8beb565db8384fdda7c1f'
            }
        ]
        return context


def GetRezFlowData(request):
    """
    View get data from API vai curl
    """
    print('in: GetREzFlowData')

    res_date = request.GET.get("date", None)
    company = request.GET.get("company", None)

    url = f'https://api.checkin.dev.rezflow.io/check-in/weights/{res_date}'
    headers = {
        'Company': company,
        'Authorization': REZFLOW_API_KEY,
        'Accept': 'application/json'
    }

    result = requests.get(url, headers=headers)
    print(result.text)

    return JsonResponse({'json': json.loads(result.text)})
