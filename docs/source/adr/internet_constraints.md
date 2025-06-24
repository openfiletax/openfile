# Bandwidth Constraints

Our users are going to come from all over the country, with a variety of access to broadband internet. We want to make sure that we're supporting the vast majority of users. To specify that further, we're looking to device and bandwidth data, and deciding the following constraints:

## Bandwidth Constraints

Source for bandwidth data is the [FCC 2021 Bandwidth Progress Report](https://docs.fcc.gov/public/attachments/FCC-21-18A1.pdf), which reports bandwidth levels through 2019. 

As of 2019, 99.9% of people in the US have access to either:
1. Mobile 4G LTE
with a Minimum Advertised Speed of 5/1 Mbps OR
2. Fixed Terrestrial 25/3 Mbps 

including 99.7% of people in in rural areas and 97.9% of people on Tribal lands (fig 3c).

Given this, we can support 99.9% of our population by supporting users with **5Mbps down/ 1Mbps up**. 

## Latency Constraints

The FCC does not include latency in its Bandwidth Progress Report (III.A.17), so we're left to other less official sources. However, we can set our bar at "what is the latency of 4G LTE, given that it's going to be the worst case latency for the 99.9% of people who have 4G LTE or Terrestrial 25/3 Mbps"?

In this case, latency refers to the time it takes for your phone to get a response from the cell tower at the other side of its radio link. It doesn't include time from that radio link to our cloud data center, or any processing we'd do there, or the response time. But this is the measure that would put 4G on the same page as a terrestrial link. 

Average 4g latency is around and lower than 50ms<sup>[1](https://www.statista.com/statistics/818205/4g-and-3g-network-latency-in-the-united-states-2017-by-provider/),[2](https://www.lightreading.com/mobile/4g-lte/lte-a-latent-problem/d/d-id/690536)</sup> while maximum latencies I can find on the internet seem to be around 100ms (though this seems hard to find information on!)<sup>[3](https://www.researchgate.net/figure/Maximum-and-average-latency-in-4G-and-3G-networks-6_fig3_338598740)</sup>

Given this, we should set our **latency target at 100ms** to support the worst case of the 99.9% of people in the US whose worst connection choice is 4G LTE. 

### Dev suggestion
To assume the case of our worst case users, you can create a [network throttling profile](https://developer.chrome.com/docs/devtools/settings/throttling/) in Chrome devtools. You can use the app with that profile enabled to see the loading screens and timing experience that we're expecting of our worst case users. 

#### Appendix

In 2023, apparently you can take zoom calls from the side of the mountain. And in 2024, maybe TKTK will file his taxes from there, too. 

<img width="695" alt="On a mountain" src="https://github-production-user-asset-6210df.s3.amazonaws.com/135663320/251536414-ce525b7c-e795-49cd-ab33-6950a54d5ec4.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250416%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250416T225041Z&X-Amz-Expires=300&X-Amz-Signature=be26cddd37bb08083453688fa707babf3f8ea027eb3d66e0a672b4f4724e4e62&X-Amz-SignedHeaders=host">